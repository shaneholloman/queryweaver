"""Custom exceptions for the text2sql API."""

# Interal Error Exception
class InternalError(Exception):
    """Custom exception for internal errors."""
    pass

# Graph not found Exception
class GraphNotFoundError(Exception):
    """Custom exception for graph not found errors."""
    pass

# Wrong argument Exception
class InvalidArgumentError(Exception):
    """Custom exception for invalid argument errors."""
    pass
