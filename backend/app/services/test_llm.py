from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint
from dotenv import load_dotenv
import os 

load_dotenv()
token = os.getenv("HUGGINGFACE_API_TOKEN")

# 1. Use huggingfacehub_api_token instead of token
llm = HuggingFaceEndpoint(
    repo_id="Qwen/Qwen2.5-7B-Instruct",
    max_new_tokens=1000,
    temperature=0.1,
    huggingfacehub_api_token=token,
    provider="hf-inference"
)
    
llm_engine = ChatHuggingFace(llm=llm)

result = llm_engine.invoke("What is the capital of Pakistan")

print(result.content)