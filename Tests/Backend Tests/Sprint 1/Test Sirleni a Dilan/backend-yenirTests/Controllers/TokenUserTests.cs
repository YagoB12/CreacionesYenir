using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using backend_yenir.Models;
using backend_yenir.Models.Enums;
using backend_yenir.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace TokenUser.Tests
{
    [TestClass]
    public class TokenUserTests
    {
        [TestMethod]
        public void GenerateToken_ReturnsValidJwtToken()
        {
            // =========================
            // Arrange
            // =========================
            // Configuración falsa de JWT
            var inMemorySettings = new Dictionary<string, string>
            {
                { "Jwt:SecretKey", "SUPER_SECRET_KEY_123456789_ABCDEFGH" },
                { "Jwt:Issuer", "TestIssuer" },
                { "Jwt:Audience", "TestAudience" },
                { "Jwt:ExpirationMinutes", "60" }
            };

            IConfiguration configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings!)
                .Build();
            //Crea servicio jwt
            var jwtService = new JwtService(configuration);

            var user = new User
            {
                Id = 1,
                Email = "test@email.com",
                Role = UserRole.CLIENT
            };

            // =========================
            // Act
            // =========================
            var token = jwtService.GenerateToken(user);

            // =========================
            // Assert
            // =========================
            //Comprueba que no nea null y que el tamaño sea mayor a 0
            Assert.IsNotNull(token);
            Assert.IsTrue(token.Length > 0);


            //Seguridad del token
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);
            //Comprueba si tiene las config asignadas
            Assert.AreEqual("TestIssuer", jwtToken.Issuer);
            Assert.IsTrue(jwtToken.Audiences.Contains("TestAudience"));
            //Compruba el contenido del token (tener gmail, idUser y el rol)
            Assert.AreEqual(
                "1",
                jwtToken.Claims.First(c => c.Type == ClaimTypes.NameIdentifier).Value
            );

            Assert.AreEqual(
                "test@email.com",
                jwtToken.Claims.First(c => c.Type == ClaimTypes.Email).Value
            );

            Assert.AreEqual(
                UserRole.CLIENT.ToString(),
                jwtToken.Claims.First(c => c.Type == ClaimTypes.Role).Value
            );
        }
    }
}
