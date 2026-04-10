const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Node Js API",
            version: "1.0.0",
            description: "API documentation for Order Management System with JWT authentication",
            contact: {
                name: "API Support"
            }
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Development server"
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Enter JWT token obtained from /auth/login endpoint"
                }
            },
            schemas: {
                LoginRequest: {
                    type: "object",
                    required: ["username", "password"],
                    properties: {
                        username: {
                            type: "string",
                            example: "admin",
                            description: "Username for authentication"
                        },
                        password: {
                            type: "string",
                            format: "password",
                            example: "123456",
                            description: "Password for authentication"
                        }
                    }
                },
                LoginResponse: {
                    type: "object",
                    properties: {
                        token: {
                            type: "string",
                            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                            description: "JWT token for authentication"
                        }
                    }
                },
                OrderItem: {
                    type: "object",
                    required: ["idItem", "quantidadeItem", "valorItem"],
                    properties: {
                        idItem: {
                            type: "string",
                            example: "1",
                            description: "Product ID"
                        },
                        quantidadeItem: {
                            type: "number",
                            example: 2,
                            description: "Quantity of the item"
                        },
                        valorItem: {
                            type: "number",
                            example: 500.00,
                            description: "Price of the item"
                        }
                    }
                },
                OrderRequest: {
                    type: "object",
                    required: ["numeroPedido", "dataCriacao", "valorTotal", "items"],
                    properties: {
                        numeroPedido: {
                            type: "string",
                            example: "123-1",
                            description: "Order number (format: number-sequence)"
                        },
                        dataCriacao: {
                            type: "string",
                            format: "date-time",
                            example: "2024-01-15T10:30:00Z",
                            description: "Order creation date"
                        },
                        valorTotal: {
                            type: "number",
                            example: 1000.00,
                            description: "Total order value"
                        },
                        items: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/OrderItem"
                            },
                            description: "List of order items"
                        }
                    }
                },
                OrderResponse: {
                    type: "object",
                    properties: {
                        orderId: {
                            type: "string",
                            example: "123",
                            description: "Order ID (extracted from numeroPedido)"
                        },
                        value: {
                            type: "number",
                            example: 1000.00,
                            description: "Total order value"
                        },
                        creationDate: {
                            type: "string",
                            format: "date-time",
                            example: "2024-01-15T10:30:00.000Z",
                            description: "Order creation date"
                        },
                        items: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    productId: {
                                        type: "number",
                                        example: 1
                                    },
                                    quantity: {
                                        type: "number",
                                        example: 2
                                    },
                                    price: {
                                        type: "number",
                                        example: 500.00
                                    }
                                }
                            }
                        }
                    }
                },
                Error: {
                    type: "object",
                    properties: {
                        error: {
                            type: "string",
                            example: "Error message description"
                        }
                    }
                }
            }
        },
        tags: [
            {
                name: "Authentication",
                description: "Authentication endpoints"
            },
            {
                name: "Orders",
                description: "Order management endpoints"
            }
        ]
    },
    apis: ["./routes/*.js", "./index.js"]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
