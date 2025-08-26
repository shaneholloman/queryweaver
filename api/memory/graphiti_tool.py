"""
Graphiti integration for QueryWeaver memory component.
Saves summarized conversations with user and database nodes.
"""

import asyncio
import os
from typing import Dict, Any, List, Optional
from datetime import datetime

# Import Azure OpenAI components
from openai import AsyncAzureOpenAI

# Import Graphiti components
from graphiti_core.driver.falkordb_driver import FalkorDriver
from graphiti_core import Graphiti
from api.extensions import db
from api.config import Config
from graphiti_core.nodes import EpisodeType
from graphiti_core.llm_client import LLMConfig, OpenAIClient
from graphiti_core.embedder import OpenAIEmbedder, OpenAIEmbedderConfig
from graphiti_core.cross_encoder import OpenAIRerankerClient
from graphiti_core.search.search_config_recipes import NODE_HYBRID_SEARCH_RRF

from typing import List, Dict, Any, Optional
from datetime import datetime
import json
from api.config import Config


from litellm import completion


class MemoryTool:
    """Memory management tool for handling user memories and interactions."""

    def __init__(self, user_id: str, graph_id: str):
        # Create FalkorDB driver with user-specific database
        user_memory_db = f"{user_id}-memory"
        falkor_driver = FalkorDriver(falkor_db=db, database=user_memory_db)

        # Create Graphiti client with Azure OpenAI configuration
        self.graphiti_client = create_graphiti_client(falkor_driver)

        self.user_id = user_id
        self.graph_id = graph_id
        self.config = Config()


    @classmethod
    async def create(cls, user_id: str, graph_id: str) -> "MemoryTool":
        """Async factory to construct and initialize the tool."""
        self = cls(user_id, graph_id)
        await asyncio.gather(
            self._ensure_user_node(user_id),
            self._ensure_database_node(graph_id, user_id),
        )
        return self

    async def _ensure_user_node(self, user_id: str) -> Optional[str]:
        """Ensure user node exists in the memory graph."""
        user_node_name = f"User {user_id}"
        try:
            # First check if user node already exists
            node_search_config = NODE_HYBRID_SEARCH_RRF.model_copy(deep=True)
            node_search_config.limit = 1  # Limit to 1 results

            # Execute the node search
            node_search_results = await self.graphiti_client.search_(
                query=user_node_name,
                config=node_search_config,
            )
            
            # If user node already exists, return the user_id
            if node_search_results and len(node_search_results.nodes) > 0:
                # Check if any result exactly matches the expected node name
                for node in node_search_results.nodes:
                    if node.name == user_node_name:
                        print(f"User node for {user_id} already exists")
                        return user_id
            
            # Create new user node if it doesn't exist
            await self.graphiti_client.add_episode(
                name=user_node_name,
                episode_body=f'User {user_id} is using QueryWeaver',
                source=EpisodeType.text,
                reference_time=datetime.now(),
                source_description='User node creation'
            )
            print(f"Created new user node for {user_id}")
            return user_id
            
        except Exception as e:
            print(f"Error creating user node for {user_id}: {e}")
            return None

    async def _ensure_database_node(self, database_name: str, user_id: str) -> Optional[str]:
        """Ensure database node exists in the memory graph."""
        database_node_name = f"Database {database_name}"
        try:
            # First check if database node already exists
            node_search_config = NODE_HYBRID_SEARCH_RRF.model_copy(deep=True)
            node_search_config.limit = 1  # Limit to 1 results

            # Execute the node search
            node_search_results = await self.graphiti_client.search_(
                query=database_node_name,
                config=node_search_config,
            )
            
            # If database node already exists, return the database_name
            if node_search_results and len(node_search_results.nodes) > 0:
                # Check if any result exactly matches the expected node name
                for node in node_search_results.nodes:
                    if node.name == database_node_name:
                        print(f"Database node for {database_name} already exists")
                        return database_name
            
            # Create new database node if it doesn't exist
            await self.graphiti_client.add_episode(
                name=database_node_name,
                episode_body=f'User {user_id} has database {database_name} available for querying',
                source=EpisodeType.text,
                reference_time=datetime.now(),
                source_description='Database node creation'
            )
            print(f"Created new database node for {database_name}")
            return database_name
            
        except Exception as e:
            print(f"Error creating database node for {database_name}: {e}")
            return None
        
    async def add_new_memory(self, conversation: List[Dict[str, Any]]) -> bool:
        # Use LLM to analyze and summarize the conversation with current database context
        analysis = await self.summarize_conversation(conversation)
        user_id = self.user_id
        database_name = self.graph_id

        # Extract summaries
        database_summary = analysis.get("database_summary", "")
        personal_memory = analysis.get("personal_memory", "")

        if database_summary:
            await self.graphiti_client.add_episode(
                    name=f"Database_Summary_{user_id}_{database_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                    episode_body=f"User: {user_id}\nDatabase: {database_name}\nConversation: {database_summary}",
                    source=EpisodeType.message,
                    reference_time=datetime.now(),
                    source_description=f"User: {user_id} conversation with the Database: {database_name}"
                )
        if personal_memory:
            await self.graphiti_client.add_episode(
                    name=f"Personal_Memory_{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                    episode_body=f"User: {user_id}\nPersonal Memory: {personal_memory}",
                    source=EpisodeType.message,
                    reference_time=datetime.now(),
                    source_description=f"Personal memory for user {user_id}"
                )

    async def search_user_summary(self, limit: int = 5) -> str:
        """
        Search for user node summary extracts the user's personal information and general preferences.

        Args:
            query: Natural language query to search for
            limit: Maximum number of results to return
            
        Returns:
            List of user node summaries with metadata
        """
        try:
            # First, find the user node specifically
            user_node_search_config = NODE_HYBRID_SEARCH_RRF.model_copy(deep=True)
            user_node_search_config.limit = limit
            
            user_node_results = await self.graphiti_client.search_(
                query=f'User {self.user_id}',
                config=user_node_search_config,
            )
            
            for node in user_node_results.nodes:
                if node.name == f"User {self.user_id}":
                    user_summary = node.summary
                    return user_summary

            return ""
            
        except Exception as e:
            print(f"Error searching user node for {self.user_id}: {e}")
            return ""

    async def search_database_facts(self, query: str, limit: int = 10) -> str:
        """
        Search for database-specific facts and interaction history using database node as center.
        
        Args:
            query: Natural language query to search for database facts
            limit: Maximum number of results to return
            
        Returns:
            String containing all relevant database facts with time relevancy information
        """
        try:
            # First, find the database node to use as center for reranking
            database_node_search_config = NODE_HYBRID_SEARCH_RRF.model_copy(deep=True)
            database_node_search_config.limit = limit
            
            database_node_results = await self.graphiti_client.search_(
                query=f'Database {self.graph_id}',
                config=database_node_search_config,
            )

            center_node_uuid = None
            for node in database_node_results.nodes:
                if node.name == f"Database {self.graph_id}":
                    print(f'Found database node: {node.name} with UUID: {node.uuid}')
                    center_node_uuid = node.uuid
                    break

            if center_node_uuid is None:
                return ""
   
            
            # Enhance query to focus on database-specific content
            enhanced_query = f"Database {self.graph_id} and the query: {query}"

            reranked_results = await self.graphiti_client.search(
                query=enhanced_query,
                center_node_uuid=center_node_uuid,
                num_results=limit
            )
            
            
            # Filter and format results for database-specific content into a single string
            database_facts_text = []
            if reranked_results and len(reranked_results) > 0:
                print(f'\nDatabase Facts Search Results for {self.graph_id}:')
                for i, result in enumerate(reranked_results, 1):
                    if result.source_node_uuid != center_node_uuid and result.target_node_uuid != center_node_uuid:
                        continue
                    
                    fact_entry = f"Fact {i}: {result.fact}"
                    
                    # Add time information if available
                    time_info = []
                    if hasattr(result, 'valid_at') and result.valid_at:
                        time_info.append(f"Valid from: {result.valid_at}")
                    if hasattr(result, 'invalid_at') and result.invalid_at:
                        time_info.append(f"Valid until: {result.invalid_at}")
                    
                    if time_info:
                        fact_entry += f" ({', '.join(time_info)})"
                    
                    database_facts_text.append(fact_entry)

            # Join all facts into a single string
            return "\n".join(database_facts_text) if database_facts_text else ""
            
        except Exception as e:
            print(f"Error searching database facts for {self.graph_id}: {e}")
            return ""

    async def search_memories_concurrent(self, query: str, user_limit: int = 5, database_limit: int = 10) -> Dict[str, Any]:
        """
        Run both user summary and database facts searches concurrently for better performance.
        
        Args:
            query: Natural language query to search for database facts
            user_limit: Maximum number of results for user summary search
            database_limit: Maximum number of results for database facts search
            
        Returns:
            Dict containing both user_summary and database_facts results
        """
        try:
            # Run both searches concurrently using asyncio.gather
            user_summary_task = self.search_user_summary(limit=user_limit)
            database_facts_task = self.search_database_facts(query=query, limit=database_limit)
            
            # Wait for both to complete
            user_summary, database_facts = await asyncio.gather(
                user_summary_task,
                database_facts_task,
                return_exceptions=True
            )
            
            return {
                "user_summary": user_summary,
                "database_facts": database_facts,
            }
            
        except Exception as e:
            print(f"Error in concurrent memory search: {e}")
            return {
                "user_summary": "",
                "database_facts": "",
            }

    async def summarize_conversation(self, conversation: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Use LLM to summarize the conversation and extract insights oriented to current database.
        
        Args:
            conversation: List of user/system exchanges
            
        Returns:
            Dict with 'database_summary' and 'personal_memory' keys
        """
        # Format conversation for summarization
        conv_text = ""
        for exchange in conversation:
            conv_text += f"User: {exchange.get('question', '')}\n"
            if exchange.get('sql'):
                conv_text += f"SQL: {exchange['sql']}\n"
            if exchange.get('answer'):
                conv_text += f"Assistant: {exchange['answer']}\n"
            conv_text += "\n"
        
        prompt = f"""
                Analyze this QueryWeaver conversation between user "{self.user_id}" and database "{self.graph_id}".
                Your task is to extract two complementary types of memory:

                1. Database-Specific Summary: What the user accomplished and their preferences with this specific database.
                2. Personal Memory: General information about the user (name, preferences, personal details) that is not specific to this database.

                Conversation:
                {conv_text}

                Format your response as JSON:
                {{
                    "database_summary": "Summarize in natural language what the user was trying to accomplish with this database, highlighting the approaches, techniques, queries, or SQL patterns that worked well, noting errors or problematic patterns to avoid, listing the most important or effective queries executed, and sharing key learnings or insights about the database’s structure, data, and optimal usage patterns.",
                    "personal_memory": "Summarize any personal information about the user, including their name if mentioned, their general preferences and working style, their SQL or database expertise level, recurring query patterns or tendencies across all databases, and any other personal details that are not specific to a particular database, making sure not to include any database-specific memories."
                }}

                Instructions:
                - Only include fields that have actual information from the conversation.
                - Use empty strings for fields with no information.
                - Do not invent any information that is not present in the conversation.
                """

        
        try:
            response = completion(
                model=self.config.COMPLETION_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1
            )
            
            # Parse JSON response
            content = response.choices[0].message.content
            if content.startswith("```json"):
                content = content.replace("```json", "").replace("```", "").strip()
            
            result = json.loads(content)
            return {
                "database_summary": result.get("database_summary", ""),
                "personal_memory": result.get("personal_memory", "")
            }
            
        except Exception as e:
            print(f"Error in LLM summarization: {e}")
            return {
                "database_summary": "",
                "personal_memory": ""
            }


class AzureOpenAIConfig:
    """Configuration for Azure OpenAI integration."""
    
    def __init__(self):
        # Set the model name as requested
        os.environ["MODEL_NAME"] = "gpt-4.1"
        
        self.api_key = os.getenv('AZURE_API_KEY')
        self.endpoint = os.getenv('AZURE_API_BASE') 
        self.api_version = os.getenv('AZURE_API_VERSION', '2024-02-01')
        self.model_choice = "gpt-4.1"  # Use the model name directly
        self.embedding_model = "text-embedding-ada-002"  # Use model name, not deployment
        self.small_model = os.getenv('AZURE_SMALL_MODEL', 'gpt-4o-mini')
        
        # Use model names directly instead of deployment names
        self.llm_deployment = self.model_choice
        self.small_model_deployment = self.small_model
        self.embedding_deployment = self.embedding_model
        
        # Embedding endpoint (can be same or different from main endpoint)
        self.embedding_endpoint = os.getenv('AZURE_EMBEDDING_ENDPOINT', self.endpoint)


def get_azure_openai_clients():
    """Configure and return Azure OpenAI clients for Graphiti."""
    config = AzureOpenAIConfig()
    
    # Validate required configuration
    if not config.endpoint:
        raise ValueError("AZURE_API_BASE environment variable is required")
    if not config.api_key:
        raise ValueError("AZURE_API_KEY environment variable is required")
    
    # Create separate Azure OpenAI clients for different services
    llm_client_azure = AsyncAzureOpenAI(
        api_key=config.api_key,
        api_version=config.api_version,
        azure_endpoint=config.endpoint,
    )

    embedding_client_azure = AsyncAzureOpenAI(
        api_key=config.api_key,
        api_version=config.api_version,
        azure_endpoint=config.embedding_endpoint,
    )

    return llm_client_azure, embedding_client_azure, config

def create_graphiti_client(falkor_driver: FalkorDriver) -> Graphiti:
    """Create a Graphiti client configured with Azure OpenAI."""
    # Get Azure OpenAI clients and config
    llm_client_azure, embedding_client_azure, config = get_azure_openai_clients()

    # Create LLM Config with Azure deployment names
    azure_llm_config = LLMConfig(
        small_model=config.small_model_deployment,
        model=config.llm_deployment,
    )

    # Initialize Graphiti with Azure OpenAI clients
    return Graphiti(
        graph_driver=falkor_driver,
        llm_client=OpenAIClient(config=azure_llm_config, client=llm_client_azure),
        embedder=OpenAIEmbedder(
            config=OpenAIEmbedderConfig(embedding_model=config.embedding_deployment),
            client=embedding_client_azure,
        ),
        cross_encoder=OpenAIRerankerClient(
            config=LLMConfig(
                model=azure_llm_config.small_model  # Use small model for reranking
            ),
            client=llm_client_azure,
        ),
    )

