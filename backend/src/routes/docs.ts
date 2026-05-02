import { Router } from "express";

import { SESSION_COOKIE_NAME } from "../lib/session.js";

const SWAGGER_UI_VERSION = "5.11.0";

const schemaRef = (name: string) => ({
  $ref: `#/components/schemas/${name}`,
});

const jsonContent = (schema: object) => ({
  "application/json": {
    schema,
  },
});

export const createOpenApiDocument = () => {
  const renderUrl = process.env.RENDER_EXTERNAL_URL?.trim();
  const localUrl = `http://localhost:${process.env.BACKEND_PORT ?? 3000}`;

  return {
    openapi: "3.0.3",
    info: {
      title: "Language Learning API",
      version: "1.0.0",
      description:
        "Interactive API documentation for the auth, profile, and words endpoints.",
    },
    servers: [
      {
        url: renderUrl,
        description: "Render deployment",
      },
      {
        url: localUrl,
        description: "Local development",
      },
    ],
    tags: [
      {
        name: "Auth",
        description: "Account registration, login, and logout",
      },
      {
        name: "Me",
        description: "Authenticated user profile endpoints",
      },
      {
        name: "Words",
        description: "Word list lookup endpoints",
      },
    ],
    components: {
      securitySchemes: {
        sessionCookie: {
          type: "apiKey",
          in: "cookie",
          name: SESSION_COOKIE_NAME,
          description: "Session cookie returned by the login endpoint.",
        },
      },
      schemas: {
        User: {
          type: "object",
          additionalProperties: false,
          required: ["id", "username", "email"],
          properties: {
            id: {
              type: "integer",
              example: 7,
            },
            username: {
              type: "string",
              minLength: 2,
              maxLength: 20,
              example: "Ada",
            },
            email: {
              type: "string",
              format: "email",
              example: "ada@example.com",
            },
          },
        },
        RegisterRequest: {
          type: "object",
          additionalProperties: false,
          required: ["username", "email", "password"],
          properties: {
            username: {
              type: "string",
              minLength: 2,
              maxLength: 20,
              example: "Ada",
            },
            email: {
              type: "string",
              format: "email",
              example: "ada@example.com",
            },
            password: {
              type: "string",
              minLength: 8,
              example: "super-secret",
            },
          },
        },
        LoginRequest: {
          type: "object",
          additionalProperties: false,
          required: ["username", "password"],
          properties: {
            username: {
              type: "string",
              minLength: 2,
              maxLength: 20,
              example: "Ada",
            },
            password: {
              type: "string",
              minLength: 8,
              example: "super-secret",
            },
          },
        },
        UpdateUserRequest: {
          type: "object",
          additionalProperties: false,
          minProperties: 1,
          properties: {
            username: {
              type: "string",
              minLength: 2,
              maxLength: 20,
              example: "NewAda",
            },
            email: {
              type: "string",
              format: "email",
              example: "new@example.com",
            },
          },
        },
        UpdatePasswordRequest: {
          type: "object",
          additionalProperties: false,
          required: ["password"],
          properties: {
            password: {
              type: "string",
              minLength: 8,
              example: "new-password",
            },
          },
        },
        ValidationErrorResponse: {
          type: "object",
          additionalProperties: false,
          required: ["formErrors", "fieldErrors"],
          properties: {
            formErrors: {
              type: "array",
              items: {
                type: "string",
              },
              example: [],
            },
            fieldErrors: {
              type: "object",
              additionalProperties: {
                type: "array",
                items: {
                  type: "string",
                },
              },
              example: {
                password: ["Must be at least 8 characters"],
              },
            },
          },
        },
        ErrorResponse: {
          type: "object",
          additionalProperties: false,
          required: ["error"],
          properties: {
            error: {
              type: "string",
              example: "Internal server error",
            },
          },
        },
        WordListItem: {
          type: "object",
          additionalProperties: false,
          required: [
            "id",
            "value",
            "languageId",
            "frequencyRank",
            "partOfSpeech",
            "translation",
            "exampleBase",
            "exampleTarget",
          ],
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            value: {
              type: "string",
              example: "Haus",
            },
            languageId: {
              type: "integer",
              example: 2,
            },
            frequencyRank: {
              type: "integer",
              nullable: true,
              example: 15,
            },
            partOfSpeech: {
              type: "string",
              nullable: true,
              example: "noun",
            },
            translation: {
              type: "string",
              nullable: true,
              example: "house",
            },
            exampleBase: {
              type: "string",
              nullable: true,
              example: "Das Haus ist groB.",
            },
            exampleTarget: {
              type: "string",
              nullable: true,
              example: "The house is big.",
            },
          },
        },
        WordLanguage: {
          type: "object",
          additionalProperties: false,
          required: ["id", "value"],
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            value: {
              type: "string",
              example: "de",
            },
          },
        },
        WordPartOfSpeech: {
          type: "object",
          additionalProperties: false,
          required: ["id", "value"],
          properties: {
            id: {
              type: "integer",
              example: 3,
            },
            value: {
              type: "string",
              example: "noun",
            },
          },
        },
        WordTranslationTarget: {
          type: "object",
          additionalProperties: false,
          required: ["id", "value", "frequencyRank", "language"],
          properties: {
            id: {
              type: "integer",
              example: 2,
            },
            value: {
              type: "string",
              example: "house",
            },
            frequencyRank: {
              type: "integer",
              nullable: true,
              example: 5,
            },
            language: schemaRef("WordLanguage"),
          },
        },
        WordTranslation: {
          type: "object",
          additionalProperties: false,
          required: ["id", "toWord"],
          properties: {
            id: {
              type: "integer",
              example: 1000,
            },
            toWord: schemaRef("WordTranslationTarget"),
          },
        },
        WordMeaning: {
          type: "object",
          additionalProperties: false,
          required: [
            "id",
            "exampleBase",
            "exampleTarget",
            "partOfSpeech",
            "translations",
          ],
          properties: {
            id: {
              type: "integer",
              example: 10,
            },
            exampleBase: {
              type: "string",
              example: "The house is big.",
            },
            exampleTarget: {
              type: "string",
              example: "Das Haus ist gross.",
            },
            partOfSpeech: schemaRef("WordPartOfSpeech"),
            translations: {
              type: "array",
              items: schemaRef("WordTranslation"),
            },
          },
        },
        WordDetail: {
          type: "object",
          additionalProperties: false,
          required: ["id", "value", "frequencyRank", "language", "meanings"],
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            value: {
              type: "string",
              example: "Haus",
            },
            frequencyRank: {
              type: "integer",
              nullable: true,
              example: 1,
            },
            language: schemaRef("WordLanguage"),
            meanings: {
              type: "array",
              items: schemaRef("WordMeaning"),
            },
          },
        },
        WordDetailList: {
          type: "array",
          items: schemaRef("WordDetail"),
        },
      },
    },
    paths: {
      "/api/auth/register": {
        post: {
          operationId: "registerUser",
          tags: ["Auth"],
          summary: "Register a new user",
          requestBody: {
            required: true,
            content: jsonContent(schemaRef("RegisterRequest")),
          },
          responses: {
            "201": {
              description: "User created",
              content: jsonContent(schemaRef("User")),
            },
            "400": {
              description: "Validation failed",
              content: jsonContent(schemaRef("ValidationErrorResponse")),
            },
            "409": {
              description: "Username or email already exists",
              content: jsonContent(schemaRef("ErrorResponse")),
            },
            "500": {
              description: "Internal server error",
              content: jsonContent(schemaRef("ErrorResponse")),
            },
          },
        },
      },
      "/api/auth/login": {
        post: {
          operationId: "loginUser",
          tags: ["Auth"],
          summary: "Log in and create a session",
          requestBody: {
            required: true,
            content: jsonContent(schemaRef("LoginRequest")),
          },
          responses: {
            "200": {
              description: "Authenticated user returned and session cookie set",
              content: jsonContent(schemaRef("User")),
            },
            "400": {
              description: "Username and/or password are incorrect.",
              content: jsonContent(schemaRef("ErrorResponse")),
            },
            "401": {
              description: "Username and/or password are incorrect.",
              content: jsonContent(schemaRef("ErrorResponse")),
            },
            "500": {
              description: "Internal server error",
              content: jsonContent(schemaRef("ErrorResponse")),
            },
          },
        },
      },
      "/api/auth/logout": {
        post: {
          operationId: "logoutUser",
          tags: ["Auth"],
          summary:
            "Log out the current authenticated user and delete the session cookie",
          security: [{ sessionCookie: [] }],
          responses: {
            "204": {
              description: "Logged out successfully and deleted session cookie",
            },
            "500": {
              description: "Internal server error",
              content: jsonContent(schemaRef("ErrorResponse")),
            },
          },
        },
      },
      "/api/me": {
        get: {
          operationId: "getCurrentUser",
          tags: ["Me"],
          summary: "Get the current authenticated user",
          security: [{ sessionCookie: [] }],
          responses: {
            "200": {
              description: "Current user profile",
              content: jsonContent(schemaRef("User")),
            },
            "401": {
              description: "Not authenticated",
              content: jsonContent(schemaRef("ErrorResponse")),
            },
            "500": {
              description: "Internal server error",
              content: jsonContent(schemaRef("ErrorResponse")),
            },
          },
        },
        patch: {
          operationId: "updateCurrentUser",
          tags: ["Me"],
          summary: "Update the current user's username or email",
          security: [{ sessionCookie: [] }],
          requestBody: {
            required: true,
            content: jsonContent(schemaRef("UpdateUserRequest")),
          },
          responses: {
            "200": {
              description: "Updated user profile",
              content: jsonContent(schemaRef("User")),
            },
            "400": {
              description: "Validation failed",
              content: jsonContent(schemaRef("ValidationErrorResponse")),
            },
            "401": {
              description: "Not authenticated",
              content: jsonContent(schemaRef("ErrorResponse")),
            },
            "500": {
              description: "Internal server error",
              content: jsonContent(schemaRef("ErrorResponse")),
            },
          },
        },
        delete: {
          operationId: "deleteCurrentUser",
          tags: ["Me"],
          summary: "Delete the current user",
          security: [{ sessionCookie: [] }],
          responses: {
            "204": {
              description: "User deleted",
            },
            "401": {
              description: "Not authenticated",
              content: jsonContent(schemaRef("ErrorResponse")),
            },
            "500": {
              description: "Internal server error",
              content: jsonContent(schemaRef("ErrorResponse")),
            },
          },
        },
      },
      "/api/me/password": {
        patch: {
          operationId: "updateCurrentUserPassword",
          tags: ["Me"],
          summary: "Update the current user's password",
          security: [{ sessionCookie: [] }],
          requestBody: {
            required: true,
            content: jsonContent(schemaRef("UpdatePasswordRequest")),
          },
          responses: {
            "200": {
              description: "Password updated",
              content: jsonContent(schemaRef("User")),
            },
            "400": {
              description: "Validation failed",
              content: jsonContent(schemaRef("ValidationErrorResponse")),
            },
            "401": {
              description: "Not authenticated",
              content: jsonContent(schemaRef("ErrorResponse")),
            },
            "500": {
              description: "Internal server error",
              content: jsonContent(schemaRef("ErrorResponse")),
            },
          },
        },
      },
      "/api/words/all": {
        get: {
          operationId: "getAllWords",
          tags: ["Words"],
          summary:
            "List all available words in the German language. NOTE: this endpoint takes a long time now ! Fix --> https://github.com/csrs/language-learning/issues/39",
          responses: {
            "200": {
              description: "List of words",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: schemaRef("WordListItem"),
                  },
                },
              },
            },
            "500": {
              description: "Internal server error",
              content: jsonContent(schemaRef("ErrorResponse")),
            },
          },
        },
      },
      "/api/words": {
        get: {
          operationId: "getWordDetails",
          tags: ["Words"],
          summary:
            "Get translation word matches and details from a German or English input word",
          parameters: [
            {
              name: "word",
              in: "query",
              required: true,
              description:
                "Full word (including or not including the article) to look up (e.g. 'werden', 'wird', 'Haus', 'haus', 'der', 'Frau', 'house')",
              schema: {
                type: "string",
                minLength: 1,
                example: "Haus",
              },
            },
            {
              name: "language",
              in: "query",
              required: true,
              description: "Language of the search term.",
              schema: {
                type: "string",
                enum: ["de", "en"],
                example: "de",
              },
            },
          ],
          responses: {
            "200": {
              description:
                "Word(s) found with translation(s), part(s) of speech, and example sentence(s)",
              content: jsonContent(schemaRef("WordDetailList")),
            },
            "400": {
              description:
                "Invalid parameters, unsupported language, or missing configured language",
              content: jsonContent({
                oneOf: [
                  schemaRef("ValidationErrorResponse"),
                  schemaRef("ErrorResponse"),
                ],
              }),
            },
            "404": {
              description: "No matches found for the requested lookup",
              content: jsonContent(schemaRef("ErrorResponse")),
            },
            "500": {
              description: "Internal server error",
              content: jsonContent(schemaRef("ErrorResponse")),
            },
          },
        },
      },
    },
  };
};

const createSwaggerUiHtml = (openApiJsonUrl: string) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="Language Learning API docs" />
    <title>Language Learning API Docs</title>
    <link
      rel="stylesheet"
      href="https://unpkg.com/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui.css"
    />
    <style>
      html {
        box-sizing: border-box;
        overflow-y: scroll;
      }

      *,
      *::before,
      *::after {
        box-sizing: inherit;
      }

      body {
        margin: 0;
        background: #f5f7fb;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script
      src="https://unpkg.com/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui-bundle.js"
      crossorigin
    ></script>
    <script
      src="https://unpkg.com/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui-standalone-preset.js"
      crossorigin
    ></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: ${JSON.stringify(openApiJsonUrl)},
          dom_id: "#swagger-ui",
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          layout: "StandaloneLayout",
          deepLinking: true,
        });
      };
    </script>
  </body>
</html>`;

export const router = Router();

router.get("/", (_req, res) => {
  res.type("html").send(createSwaggerUiHtml("/api/docs/openapi.json"));
});

router.get("/openapi.json", (_req, res) => {
  res.json(createOpenApiDocument());
});
