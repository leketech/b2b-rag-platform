import json
import logging

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)


def load_secret(secret_name: str, region: str = "us-east-1") -> dict:
    """Fetch a JSON secret from AWS Secrets Manager and return it as a dict.

    Uses IRSA (IAM Roles for Service Accounts) when running in EKS — no
    static AWS credentials are required in the pod.
    """
    client = boto3.client("secretsmanager", region_name=region)
    try:
        response = client.get_secret_value(SecretId=secret_name)
    except ClientError as exc:
        error_code = exc.response["Error"]["Code"]
        logger.error("Failed to retrieve secret %s: %s (%s)", secret_name, exc, error_code)
        raise RuntimeError(f"Could not load secret '{secret_name}' from Secrets Manager") from exc

    raw = response.get("SecretString")
    if raw is None:
        raise RuntimeError(f"Secret '{secret_name}' has no SecretString (binary secrets not supported)")

    try:
        return json.loads(raw)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Secret '{secret_name}' is not valid JSON") from exc
