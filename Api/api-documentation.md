# Api Documentation

A summary of information around each endpoint.

## Common Error Response

This is a common error structure pattern implemented in all endpoints.

**Condition** : If there was a service error in the database or other backend layers, it may bubble up to the Api response.

**Code** : `400 BAD REQUEST`

**Content Example**

```json
"There was an error: [error message]"
```

<br><br><br>

# Heartbeat

This call is designed to test the service, make sure it's up and responding.

<br>

**URL** : `/heartbeat`

**Method** : `GET`

**Auth required** : no

## Success Response

**Code** : `200 OK`

**Content example**

```json
{
  "name": "tbd",
  "vitals": {}
}
```

## Error Response

**Condition** : If the server is down or unresponsive, then the call will time out.

<br><br><br>

# Me

Returns name and email of the user currently logged in.

<br>

**URL** : `/me`

**Method** : `GET`

**Auth required** : no

## Success Response

**Code** : `200 OK`

**Content example**

```json
{
  "name": "Bruce Wayne",
  "email": "batman@justiceleague.com"
}
```

## Error Response

**Condition** : If the user is not logged in or has an invalid token.

**Code** : `400 BAD REQUEST`

**Content example**

```json
"Not logged in"
```

<br><br><br>

# Account

This is where a user can sign in, sign up, or log out.  *Password reset requests and implementation is on the way soon.*

<br>

**URL** : `/account/signup`

**Method** : `POST`

**Auth required** : no

**Data constraints**

```json
{
  "name": "[non-empty string]",
  "email": "[valid email address]",
  "password": "[valid password in plain text, 8-24 characters, at least one number, uppercase, lowercase, and symbol]",
  "confirmPassword": "[valid matching password in plain text]"
}
```

**Data example**

```json
{
  "name": "Bruce Wayne",
  "email": "batman@justiceleague.com",
  "password": "DarkKnight39!",
  "confirmPassword": "DarkKnight39!"
}
```

## Success Response

**Code** : `201 CREATED`

**Content example**

```json
{
    "message": "success"
}
```

## Error Response

**Condition** : Validation failure

**Code** : `422 UNPROCESSABLE ENTITY`

**Content example**

```json
{
    "errors": [
        {
            "value": "batman@justiceleague.com",
            "msg": "Email is already in use",
            "param": "email",
            "location": "body"
        },
        {
            "value": "DarkKnight39",
            "msg": "Password must contain at least one uppercase letter, one lowercase letter, and one symbol",
            "param": "password",
            "location": "body"
        }
    ]
}
```

<br><br><br>

**URL** : `/account/signin`

**Method** : `POST`

**Auth required** : no

**Data constraints**

```json
{
  "email": "[valid email]",
  "password": "[password in plain text]"
}
```

**Data example**

```json
{
  "email": "batman@justiceleague.com",
  "password": "DarkKnight39!"
}
```

## Success Response

**Code** : `200 OK`

**Content example**

```json
{
    "message": "success"
}
```

## Error Response

**Condition** : If the email or password is incorrect or if the user doesn't exist.

**Code** : `400 BAD REQUEST`

**Content example**
```json
"Invalid username or password!"
```

<br><br><br>

**URL** : `/account/signout`

**Method** : `POST`

**Auth required** : no

**Data constraints**

none

## Success Response

**Code** : `200 OK`

**Content example**

```json
{
    "message": "Goodbye!"
}
```

## Error Response

None.  This call will always succeed and always trigger removal of the auth token from the headers if it exists.