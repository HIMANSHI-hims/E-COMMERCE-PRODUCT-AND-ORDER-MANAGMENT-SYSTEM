import oracledb
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routers import products, orders, admin, login, public, account, subqueries

app = FastAPI(title="ELVORA API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(oracledb.Error)
async def database_error(request, exc):
    print("Database error:", exc)  # the full Oracle error stays in this terminal
    return JSONResponse(status_code=500, content={"detail": "Database error. Check the backend terminal."})


app.include_router(login.router)
app.include_router(account.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(admin.router)
app.include_router(public.router)
app.include_router(admin.router)
app.include_router(subqueries.router)


@app.get("/")
def health():
    return {"status": "ok"}