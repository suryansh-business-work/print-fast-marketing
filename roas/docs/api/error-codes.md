# Error Codes

## Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description",
    "details": []
  }
}
```

## Error Code Reference

### Authentication

| Code                      | HTTP | Description                          |
| ------------------------- | :--: | ------------------------------------ |
| `AUTHENTICATION_REQUIRED` | 401  | No valid session found               |
| `INVALID_CREDENTIALS`     | 401  | Wrong email or password              |
| `SESSION_EXPIRED`         | 401  | Session has expired                  |
| `ACCOUNT_DEACTIVATED`     | 401  | User account is deactivated          |

### Authorization

| Code                       | HTTP | Description                              |
| -------------------------- | :--: | ---------------------------------------- |
| `INSUFFICIENT_PERMISSIONS` | 403  | User role lacks permission               |
| `ROLE_ESCALATION_DENIED`   | 403  | Cannot create user with higher/equal role |
| `ADMIN_SIGNUP_DISABLED`    | 403  | Admin signup flag is off                 |
| `GOD_USER_SIGNUP_DENIED`   | 403  | God User cannot be created via signup    |
| `SELF_MODIFICATION_DENIED` | 400  | Cannot deactivate or change own role     |

### Validation

| Code                | HTTP | Description                       |
| ------------------- | :--: | --------------------------------- |
| `VALIDATION_ERROR`  | 400  | Zod validation failed             |
| `INVALID_OBJECT_ID` | 400  | Invalid MongoDB ObjectId          |

### Resources

| Code                 | HTTP | Description                      |
| -------------------- | :--: | -------------------------------- |
| `RESOURCE_NOT_FOUND` | 404  | Resource does not exist          |
| `DUPLICATE_EMAIL`    | 409  | Email already in use             |
| `DUPLICATE_RESOURCE` | 409  | Resource with identifier exists  |

### Rate Limiting

| Code                  | HTTP | Description                    |
| --------------------- | :--: | ------------------------------ |
| `RATE_LIMIT_EXCEEDED` | 429  | Too many requests              |

### Server

| Code                    | HTTP | Description                  |
| ----------------------- | :--: | ---------------------------- |
| `INTERNAL_SERVER_ERROR` | 500  | Unexpected server error      |
| `DATABASE_ERROR`        | 500  | Database operation failed    |

## Validation Error Details

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "email", "message": "Invalid email format" },
      { "field": "password", "message": "Must be at least 8 characters" }
    ]
  }
}
```
