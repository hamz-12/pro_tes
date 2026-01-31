from pydantic.v1 import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    DATABASE_URL: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    HUGGINGFACE_API_TOKEN: str
    
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]
    
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 10485760  
    
    class Config:
        env_file = ".env"

settings = Settings()