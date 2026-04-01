using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend_yenir.Models;
using Microsoft.IdentityModel.Tokens;

namespace backend_yenir.Services
{
    /// <summary>
    /// Servicio que genera tokens JWT para autenticación.
    /// 
    /// Un token JWT contiene:
    /// - ID del usuario
    /// - Email
    /// - Rol (ADMIN o CLIENT)
    /// - Fecha de expiración
    /// 
    /// El token se envía al cliente y se usa en cada petición para validar que es un usuario autenticado.
    /// </summary>
    public class JwtService
    {
        private readonly IConfiguration _configuration;

        /// <summary>
        /// Constructor que recibe la configuración desde appsettings.json
        /// </summary>
        public JwtService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        /// <summary>
        /// Genera un token JWT para un usuario que se autenticó.
        /// 
        /// El token expira en 60 minutos (configurable).
        /// 
        /// Uso:
        /// var token = _jwtService.GenerateToken(user);
        /// </summary>
        /// <param name="user">El usuario autenticado</param>
        /// <returns>Token JWT como string (enviar al cliente)</returns>
        public string GenerateToken(User user)
        {
            // Obtener la clave secreta de appsettings.json
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _configuration["Jwt:SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey no configurada")));
            
            // Crear la firma del token
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            // Datos que van en el token
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),      // ID usuario
                new Claim(ClaimTypes.Email, user.Email),                        // Email
                new Claim(ClaimTypes.Name, user.Email),                         // Nombre
                new Claim(ClaimTypes.Role, user.Role.ToString())               // Rol
            };

            // Crear el token
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],                          // Quién lo emite
                audience: _configuration["Jwt:Audience"],                      // Para quién es
                claims: claims,                                                // Datos del token
                expires: DateTime.UtcNow.AddMinutes(Convert.ToInt32(_configuration["Jwt:ExpirationMinutes"])), // Cuándo expira
                signingCredentials: credentials);                              // Firma del token

            // Convertir a string y devolver
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
