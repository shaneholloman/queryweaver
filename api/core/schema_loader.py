"""Database connection routes for the text2sql API."""

import logging
import json
import time

from pydantic import BaseModel

from api.core.errors import InvalidArgumentError
from api.loaders.postgres_loader import PostgresLoader
from api.loaders.mysql_loader import MySQLLoader

# Use the same delimiter as in the JavaScript frontend for streaming chunks
MESSAGE_DELIMITER = "|||FALKORDB_MESSAGE_BOUNDARY|||"

class DatabaseConnectionRequest(BaseModel):
    """Database connection request model.

    Args:
        BaseModel (_type_): _description_
    """

    url: str

async def load_database(url: str, user_id: str):
    """
    Accepts a JSON payload with a database URL and attempts to connect.
    Supports both PostgreSQL and MySQL databases.
    Streams progress steps as a sequence of JSON messages separated by MESSAGE_DELIMITER.
    """

    # Validate URL format
    if len(url.strip()) == 0:
        raise InvalidArgumentError("Invalid URL format")

    async def generate():
        overall_start = time.perf_counter()
        steps_counter = 0
        try:
            # Step 1: Start
            steps_counter += 1
            yield json.dumps(
                {
                    "type": "reasoning_step",
                    "message": f"Step {steps_counter}: Starting database connection",
                }
            ) + MESSAGE_DELIMITER

            # Step 2: Determine type
            db_type = None
            if url.startswith("postgres://") or url.startswith("postgresql://"):
                db_type = "postgresql"
                loader = PostgresLoader
            elif url.startswith("mysql://"):
                db_type = "mysql"
                loader = MySQLLoader
            else:
                yield json.dumps(
                    {"type": "error", "message": "Invalid database URL format"}
                ) + MESSAGE_DELIMITER
                return

            steps_counter += 1
            yield json.dumps(
                {
                    "type": "reasoning_step",
                    "message": f"Step {steps_counter}: Detected database type: {db_type}. "
                                "Attempting to load schema...",
                }
            ) + MESSAGE_DELIMITER

            # Step 3: Attempt to load schema using the loader
            success, result = [False, ""]
            try:
                load_start = time.perf_counter()
                async for progress in loader.load(user_id, url):
                    success, result = progress
                    if success:
                        steps_counter += 1
                        yield json.dumps(
                            {
                                "type": "reasoning_step",
                                "message": f"Step {steps_counter}: {result}",
                            }
                        ) + MESSAGE_DELIMITER
                    else:
                        break

                load_elapsed = time.perf_counter() - load_start
                logging.info(
                    "Database load attempt finished in %.2f seconds", load_elapsed
                )

                if success:
                    yield json.dumps(
                        {
                            "type": "final_result",
                            "success": True,
                            "message": "Database connected and schema loaded successfully",
                        }
                    ) + MESSAGE_DELIMITER
                else:
                    # Don't stream the full internal result; give higher-level error
                    logging.error("Database loader failed: %s", str(result))  # nosemgrep
                    yield json.dumps(
                        {"type": "error", "message": "Failed to load database schema"}
                    ) + MESSAGE_DELIMITER
            except Exception as e:  # pylint: disable=broad-exception-caught
                logging.exception("Error while loading database schema: %s", str(e))
                yield json.dumps(
                    {"type": "error", "message": "Error connecting to database"}
                ) + MESSAGE_DELIMITER

        except Exception as e:  # pylint: disable=broad-exception-caught
            logging.exception("Unexpected error in connect_database stream: %s", str(e))
            yield json.dumps(
                {"type": "error", "message": "Internal server error"}
            ) + MESSAGE_DELIMITER
        finally:
            overall_elapsed = time.perf_counter() - overall_start
            logging.info(
                "connect_database processing completed - Total time: %.2f seconds",
                overall_elapsed,
            )

    return generate()

async def list_databases(user_id: str, general_prefix: str, db) -> list[str]:
    """
    This route is used to list all the graphs (databases names) that are available in the database.
    """
    user_graphs = await db.list_graphs()

    # Only include graphs that start with user_id + '_', and strip the prefix
    filtered_graphs = [graph[len(f"{user_id}_"):]
                       for graph in user_graphs if graph.startswith(f"{user_id}_")]

    if general_prefix:
        demo_graphs = [graph for graph in user_graphs
                       if graph.startswith(general_prefix)]
        filtered_graphs = filtered_graphs + demo_graphs

    return filtered_graphs
