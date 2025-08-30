"""Token management routes for the QueryWeaver API."""

import hashlib
import logging
import secrets
import time
from typing import List, Optional

from fastapi import APIRouter, Request, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from api.auth.user_management import token_required
from api.extensions import db


# Router
tokens_router = APIRouter()


class TokenResponse(BaseModel):
    """Response model for token creation"""
    token: str
    token_id: str
    created_at: int
    last_4_digits: str


class TokenListItem(BaseModel):
    """Response model for token list items"""
    token_id: str
    created_at: int
    last_4_digits: str


class TokenListResponse(BaseModel):
    """Response model for token list"""
    tokens: List[TokenListItem]


def _generate_secure_token() -> str:
    """Generate a cryptographically secure token"""
    return secrets.token_urlsafe(32)


def _hash_token(token: str) -> str:
    """Hash a token using SHA-256"""
    return hashlib.sha256(token.encode()).hexdigest()


async def _get_user_email_from_graph(user_id: str) -> Optional[str]:
    """Get user email from the Organizations graph"""
    try:
        organizations_graph = db.select_graph("Organizations")

        # First try to find by Identity provider_user_id
        query = """
        MATCH (identity:Identity {provider_user_id: $user_id})-[:AUTHENTICATES]->(user:User)
        RETURN user.email AS email
        LIMIT 1
        """

        result = await organizations_graph.query(query, {"user_id": user_id})

        if result.result_set:
            return result.result_set[0][0]

        return None

    except Exception as e:
        logging.error("Error getting user email from graph: %s", e)
        return None


@tokens_router.post("/generate", response_model=TokenResponse)
@token_required
async def generate_token(request: Request) -> TokenResponse:
    """Generate a new API token for the authenticated user"""
    try:
        user_id = request.state.user_id
        user_email = _get_user_email_from_graph(user_id)

        if not user_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User not found in system"
            )

        # Generate token
        token = _generate_secure_token()
        token_hash = _hash_token(token)
        token_id = secrets.token_urlsafe(16)
        created_at = int(time.time())
        last_4_digits = token[-4:]

        # Store token in Organizations graph
        organizations_graph = db.select_graph("Organizations")

        # Create token node connected to user
        create_query = """
        MATCH (user:User {email: $user_email})
        CREATE (token:Token {
            token_id: $token_id,
            token_hash: $token_hash,
            created_at: $created_at,
            last_4_digits: $last_4_digits
        })
        CREATE (user)-[:HAS_TOKEN]->(token)
        RETURN token
        """

        result = await organizations_graph.query(create_query, {
            "user_email": user_email,
            "token_id": token_id,
            "token_hash": token_hash,
            "created_at": created_at,
            "last_4_digits": last_4_digits
        })

        if not result.result_set:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create token"
            )

        logging.info("Token generated for user: %s", user_email)

        return TokenResponse(
            token=token,
            token_id=token_id,
            created_at=created_at,
            last_4_digits=last_4_digits
        )

    except HTTPException:
        raise
    except Exception as e:
        logging.error("Error generating token: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        ) from e


@tokens_router.get("/list", response_model=TokenListResponse)
@token_required
async def list_tokens(request: Request) -> TokenListResponse:
    """List all tokens for the authenticated user"""
    try:
        user_id = request.state.user_id
        user_email = await _get_user_email_from_graph(user_id)

        if not user_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User not found in system"
            )

        # Get tokens from Organizations graph
        organizations_graph = db.select_graph("Organizations")

        query = """
        MATCH (user:User {email: $user_email})-[:HAS_TOKEN]->(token:Token)
        RETURN token.token_id AS token_id,
               token.created_at AS created_at,
               token.last_4_digits AS last_4_digits
        ORDER BY token.created_at DESC
        """

        result = await organizations_graph.query(query, {"user_email": user_email})

        tokens = []
        if result.result_set:
            for row in result.result_set:
                tokens.append(TokenListItem(
                    token_id=row[0],
                    created_at=row[1],
                    last_4_digits=row[2]
                ))

        return TokenListResponse(tokens=tokens)

    except HTTPException:
        raise
    except Exception as e:
        logging.error("Error listing tokens: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        ) from e


@tokens_router.delete("/{token_id}")
@token_required
async def delete_token(request: Request, token_id: str) -> JSONResponse:
    """Delete a specific token for the authenticated user"""
    try:
        user_id = request.state.user_id
        user_email = _get_user_email_from_graph(user_id)

        if not user_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User not found in system"
            )

        # Delete token from Organizations graph
        organizations_graph = db.select_graph("Organizations")

        # First check if token belongs to user
        check_query = """
        MATCH (user:User {email: $user_email})-[:HAS_TOKEN]->(token:Token {token_id: $token_id})
        RETURN token
        """

        result = await organizations_graph.query(check_query, {
            "user_email": user_email,
            "token_id": token_id
        })

        if not result.result_set:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Token not found"
            )

        # Delete the token
        delete_query = """
        MATCH (user:User {email: $user_email})-[r:HAS_TOKEN]->(token:Token {token_id: $token_id})
        DELETE r, token
        """

        await organizations_graph.query(delete_query, {
            "user_email": user_email,
            "token_id": token_id
        })

        logging.info("Token deleted for user %s: token_id=%s", user_email, token_id)

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"message": "Token deleted successfully"}
        )

    except HTTPException:
        raise
    except Exception as e:
        logging.error("Error deleting token: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        ) from e


async def validate_api_token(token: str) -> Optional[str]:
    """
    Validate an API token and return the associated user email if valid.
    This function is used by the authentication system.
    """
    try:
        if not token:
            return None

        token_hash = _hash_token(token)

        # Query Organizations graph for token
        organizations_graph = db.select_graph("Organizations")

        query = """
        MATCH (user:User)-[:HAS_TOKEN]->(token:Token {token_hash: $token_hash})
        RETURN user.email AS email
        LIMIT 1
        """

        result = await organizations_graph.query(query, {"token_hash": token_hash})

        if result.result_set:
            user_email = result.result_set[0][0]
            logging.info("Valid API token used by user: %s", user_email)
            return user_email

        return None

    except Exception as e:
        logging.error("Error validating API token: %s", e)
        return None
