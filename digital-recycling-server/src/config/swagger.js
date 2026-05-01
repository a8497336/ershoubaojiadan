const swaggerJsdoc = require('swagger-jsdoc')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '数码回收网 API',
      version: '1.0.0',
      description: '数码回收小程序后端API接口文档，包含小程序端和管理后台端所有接口'
    },
    servers: [
      { url: 'http://localhost:3000', description: '开发环境' },
      { url: 'https://api.example.com', description: '生产环境' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Token 认证，格式: Bearer <token>'
        }
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            code: { type: 'integer', example: 0, description: '状态码，0表示成功' },
            message: { type: 'string', example: 'success' },
            data: { type: 'object' },
            timestamp: { type: 'integer', example: 1714200000000 }
          }
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            code: { type: 'integer', example: 0 },
            message: { type: 'string', example: 'success' },
            data: {
              type: 'object',
              properties: {
                list: { type: 'array', items: {} },
                pagination: {
                  type: 'object',
                  properties: {
                    total: { type: 'integer', example: 100 },
                    page: { type: 'integer', example: 1 },
                    pageSize: { type: 'integer', example: 10 },
                    totalPages: { type: 'integer', example: 10 }
                  }
                }
              }
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            code: { type: 'integer', example: 400 },
            message: { type: 'string', example: '参数错误' },
            timestamp: { type: 'integer', example: 1714200000000 }
          }
        }
      }
    }
  },
  apis: ['./src/routes/**/*.js']
}

const swaggerSpec = swaggerJsdoc(options)

module.exports = swaggerSpec
