# API Documentation

## Base URL

```
http://localhost:5000/api/v1
```

## Conventions

### URL Structure

```
/api/v1/<resource>
/api/v1/<resource>/:id
```

- Plural nouns: `/users`, `/vendors`
- Kebab-case for multi-word: `/vendor-reports`

### HTTP Methods

| Method   | Purpose         | Example                     |
| -------- | --------------- | --------------------------- |
| `GET`    | Read            | `GET /api/v1/users`         |
| `POST`   | Create          | `POST /api/v1/auth/signup`  |
| `PUT`    | Full update     | `PUT /api/v1/users/:id`     |
| `PATCH`  | Partial update  | `PATCH /api/v1/users/:id`   |
| `DELETE` | Deactivate      | `DELETE /api/v1/users/:id`  |

### Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Success (list with pagination):**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [ ... ]
  }
}
```

### Status Codes

| Code | Usage                                    |
| ---- | ---------------------------------------- |
| 200  | Successful GET, PUT, PATCH, DELETE       |
| 201  | Successful POST (resource created)       |
| 400  | Validation error, bad request            |
| 401  | Not authenticated                        |
| 403  | Forbidden (role / feature flag)          |
| 404  | Resource not found                       |
| 409  | Conflict (e.g., duplicate email)         |
| 429  | Rate limit exceeded                      |
| 500  | Internal server error                    |

### Query Parameters (Lists)

| Parameter | Type   | Default | Description                      |
| --------- | ------ | ------- | -------------------------------- |
| `page`    | number | 1       | Page number                      |
| `limit`   | number | 20      | Items per page (max: 100)        |
| `sort`    | string | —       | Sort field (`-` prefix for desc) |
| `search`  | string | —       | Search term                      |
| `filter`  | object | —       | Field-specific filters           |

Example:
```
GET /api/v1/users?page=2&limit=10&sort=-createdAt&search=john&filter[role]=vendor_user
```

### Authentication

Protected endpoints require a valid session cookie (sent automatically by browser with `withCredentials: true`).

### Public Endpoints (No Auth)

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/signup`
- `GET /api/v1/config/public`

## Endpoint Sections

- [Authentication Endpoints](authentication-endpoints.md)
- [User Management Endpoints](user-endpoints.md)
- [Error Codes Reference](error-codes.md)
