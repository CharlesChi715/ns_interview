import pytest
from fastapi.testclient import TestClient

import app.api.calculate as calculate_module
from app.main import create_app


@pytest.fixture
def client():
    return TestClient(create_app())


def test_health(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_calculate_ok(client):
    response = client.post("/api/v1/calculate", json={"expression": "2 + 3 * (4 - 1)"})
    assert response.status_code == 200
    assert response.json() == {"expression": "2 + 3 * (4 - 1)", "result": "11"}


@pytest.mark.parametrize(
    ("expression", "code", "position"),
    [
        ("1/0", "DIVISION_BY_ZERO", 1),
        ("2+", "SYNTAX_ERROR", 2),
        ("2^3", "UNSUPPORTED_TOKEN", 1),
        ("1+" * 128 + "1", "EXPRESSION_TOO_LONG", 256),
        ("(" * 33 + "1" + ")" * 33, "TOO_DEEP", 32),
    ],
)
def test_calculate_errors(client, expression, code, position):
    response = client.post("/api/v1/calculate", json={"expression": expression})
    assert response.status_code == 400
    error = response.json()["error"]
    assert error["code"] == code
    assert error["position"] == position
    assert error["message"]


@pytest.mark.parametrize(
    "body",
    [{}, {"expression": 5}, {"expression": "1", "extra": True}, "not an object"],
)
def test_wrong_shape_is_422(client, body):
    response = client.post("/api/v1/calculate", json=body)
    assert response.status_code == 422


def test_internal_errors_stay_quiet(monkeypatch):
    def boom(_expression):
        raise RuntimeError("secret internal detail")

    monkeypatch.setattr(calculate_module, "calculate", boom)
    client = TestClient(create_app(), raise_server_exceptions=False)
    response = client.post("/api/v1/calculate", json={"expression": "1+1"})
    assert response.status_code == 500
    assert response.json()["error"]["code"] == "INTERNAL"
    assert "secret" not in response.text


def test_cors_allowlist(monkeypatch):
    monkeypatch.setenv("CORS_ORIGIN", "http://allowed.test")
    client = TestClient(create_app())
    def preflight(origin: str):
        headers = {"Origin": origin, "Access-Control-Request-Method": "POST"}
        return client.options("/api/v1/calculate", headers=headers)

    allowed = preflight("http://allowed.test")
    assert allowed.headers.get("access-control-allow-origin") == "http://allowed.test"

    denied = preflight("http://evil.test")
    assert "access-control-allow-origin" not in denied.headers
