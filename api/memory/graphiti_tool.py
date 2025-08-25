"""
Graphiti integration for QueryWeaver memory component.
Implements cognitive architecture with two types of memory:
- Episodic Memory: Past interactions and experiences 
- Semantic Memory: Facts and grounded concepts
"""

from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
import json
import asyncio
from fastapi import Request

# Import Graphiti components (will be installed via Pipfile)
try:
    from graphiti_core.driver.falkordb_driver import FalkorDriver
    from graphiti_core import Graphiti
    from graphiti_core.nodes import EpisodeType
    from graphiti_core.edges import EntityEdge
    from graphiti_core.utils.bulk_utils import RawEpisode
    GRAPHITI_AVAILABLE = True
except ImportError:
    GRAPHITI_AVAILABLE = False


class CognitiveMemorySystem:
    """
    Cognitive memory system implementing two types of memory:
    1. Episodic Memory - Past interactions and what worked/didn't work
    2. Semantic Memory - Facts and knowledge about databases/queries
    """
    
    def __init__(self, falkor_db, user_id):
        """Initialize cognitive memory system with FalkorDB."""
        self.falkor_driver = FalkorDriver(falkor_db, database=f"{user_id}_memory")
        self.graphiti_client = Graphiti(self.falkor_driver)
        self.user_id = user_id

    # ===== EPISODIC MEMORY =====
    async def save_episodic_memory(self, user_id: str, conversation: List[Dict[str, Any]], 
                                 database_name: str, what_worked: str = "", 
                                 what_to_avoid: str = "") -> bool:
        """Save episodic memory - past interactions with analysis of what worked."""
        user_graphiti_client = self._get_user_graphiti_client(user_id)
        if not user_graphiti_client:
            return False
            
        try:
            # Format episode with experience analysis
            episode_content = self._format_episodic_memory(
                conversation, database_name, what_worked, what_to_avoid
            )
            
            await user_graphiti_client.add_episode(
                name=f"QueryWeaver_Episodic_{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                episode_body=episode_content,
                source=EpisodeType.message,
                reference_time=datetime.now(),
                source_description=f"QueryWeaver episodic memory for {database_name}"
            )
            
            return True
            
        except Exception as e:
            print(f"Error saving episodic memory for user {user_id}: {e}")
            return False
    
    async def recall_episodic_memory(self, user_id: str, query: str, database_name: str) -> Dict[str, str]:
        """Recall similar past interactions and lessons learned."""
        user_graphiti_client = self._get_user_graphiti_client(user_id)
        if not user_graphiti_client:
            return {"past_interactions": "", "what_worked": "", "what_to_avoid": ""}
            
        try:
            # Get user node for centered search in user's own graph
            user_nodes = await user_graphiti_client.get_nodes_by_query(user_id)
            center_node_uuid = user_nodes[0].uuid if user_nodes else None
            
            # Search for similar past episodes in user's memory graph
            edge_results = await user_graphiti_client.search(
                query=f"QueryWeaver episodic {user_id} {database_name} {query}",
                center_node_uuid=center_node_uuid,
                num_results=3
            )
            
            if edge_results:
                facts = self._edges_to_facts_string(edge_results)
                return self._parse_episodic_facts(facts)
            
            return {"past_interactions": "", "what_worked": "", "what_to_avoid": ""}
            
        except Exception as e:
            print(f"Error recalling episodic memory for user {user_id}: {e}")
            return {"past_interactions": "", "what_worked": "", "what_to_avoid": ""}
    
    # ===== SEMANTIC MEMORY =====
    async def save_semantic_memory(self, user_id: str, database_name: str, schema_facts: List[str], 
                                 query_patterns: List[str]) -> bool:
        """Save semantic memory - facts about database schemas and query patterns."""
        user_graphiti_client = self._get_user_graphiti_client(user_id)
        if not user_graphiti_client:
            return False
            
        try:
            # Create semantic knowledge episodes in user's memory graph
            facts_content = f"Database: {database_name}\n"
            facts_content += "Schema Facts:\n" + "\n".join([f"- {fact}" for fact in schema_facts])
            facts_content += "\n\nQuery Patterns:\n" + "\n".join([f"- {pattern}" for pattern in query_patterns])
            
            await user_graphiti_client.add_episode(
                name=f"QueryWeaver_Semantic_{user_id}_{database_name}_{datetime.now().strftime('%Y%m%d')}",
                episode_body=facts_content,
                source=EpisodeType.text,
                reference_time=datetime.now(),
                source_description=f"QueryWeaver semantic knowledge for {database_name}"
            )
            
            return True
            
        except Exception as e:
            print(f"Error saving semantic memory for user {user_id}: {e}")
            return False
    
    async def recall_semantic_memory(self, user_id: str, query: str, database_name: str) -> List[str]:
        """Recall relevant facts and concepts about the database and query patterns."""
        user_graphiti_client = self._get_user_graphiti_client(user_id)
        if not user_graphiti_client:
            return []
            
        try:
            # Search for semantic knowledge in user's memory graph
            edge_results = await user_graphiti_client.search(
                query=f"QueryWeaver semantic {database_name} {query}",
                center_node_uuid=None,  # Global search within user's graph
                num_results=5
            )
            
            if edge_results:
                facts_string = self._edges_to_facts_string(edge_results)
                return [fact.strip('- ') for fact in facts_string.split('\n') if fact.strip()]
            
            return []
            
        except Exception as e:
            print(f"Error recalling semantic memory for user {user_id}: {e}")
            return []
    
    # ===== HELPER METHODS =====
    def _format_episodic_memory(self, conversation: List[Dict[str, Any]], database_name: str,
                               what_worked: str, what_to_avoid: str) -> str:
        """Format episodic memory with experience analysis."""
        content = f"Database: {database_name}\n\n"
        
        # Format conversation
        content += "Conversation:\n"
        for exchange in conversation:
            content += f"User: {exchange.get('question', '')}\n"
            if exchange.get('sql'):
                content += f"SQL: {exchange['sql']}\n"
            if exchange.get('answer'):
                content += f"QueryWeaver: {exchange['answer']}\n"
            content += "\n"
        
        # Add experience analysis
        if what_worked:
            content += f"What Worked Well: {what_worked}\n"
        if what_to_avoid:
            content += f"What to Avoid: {what_to_avoid}\n"
        
        return content
    
    def _parse_episodic_facts(self, facts_string: str) -> Dict[str, str]:
        """Parse episodic facts to extract structured learning."""
        lines = facts_string.split('\n')
        result = {"past_interactions": "", "what_worked": "", "what_to_avoid": ""}
        
        current_section = "past_interactions"
        for line in lines:
            line = line.strip('- ').strip()
            if not line:
                continue
            if "What Worked Well:" in line:
                current_section = "what_worked"
                result[current_section] = line.replace("What Worked Well:", "").strip()
            elif "What to Avoid:" in line:
                current_section = "what_to_avoid"
                result[current_section] = line.replace("What to Avoid:", "").strip()
            else:
                if result[current_section]:
                    result[current_section] += " " + line
                else:
                    result[current_section] = line
        
        return result
    
    def _edges_to_facts_string(self, entities: List[EntityEdge]) -> str:
        """Convert EntityEdge results to facts string."""
        if not entities:
            return ""
        return '\n'.join([f"- {edge.fact}" for edge in entities])
    
    async def ensure_user_node(self, user_id: str, database_name: str) -> Optional[str]:
        """Ensure user node exists in user's memory graph."""
        user_graphiti_client = self._get_user_graphiti_client(user_id)
        if not user_graphiti_client:
            return None
            
        try:
            await user_graphiti_client.add_episode(
                name='User Initialization',
                episode_body=f'{user_id} is using QueryWeaver to query {database_name} database',
                source=EpisodeType.text,
                reference_time=datetime.now(),
                source_description='QueryWeaver User Management'
            )
            
            user_nodes = await user_graphiti_client.get_nodes_by_query(user_id)
            return user_nodes[0].uuid if user_nodes else None
            
        except Exception as e:
            print(f"Error creating user node for {user_id}: {e}")
            return None
    
    def is_available(self) -> bool:
        """Check if Graphiti is available and working."""
        return GRAPHITI_AVAILABLE and hasattr(self, 'falkor_driver')
