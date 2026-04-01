using Xunit;
using backend_yenir.Controllers;
using backend_yenir.Data;
using backend_yenir.DTOs.Auth;
using backend_yenir.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Test_de_Anthony_a_Diego.Controllers
{
    public class AuthControllerTests
    {
        private ApplicationDbContext GetDb()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new ApplicationDbContext(options);
        }

        private JwtService GetJwtService()
        {
            var settings = new Dictionary<string, string>
            {
                { "Jwt:Key", "CLAVE_SUPER_SECRETA_TEST" },
                { "Jwt:Issuer", "TestIssuer" },
                { "Jwt:Audience", "TestAudience" }
            };

            IConfiguration configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(settings)
                .Build();

            return new JwtService(configuration);
        }

        [Fact]
        public async Task Register_AddsUser()
        {
            // Arrange
            var context = GetDb();
            var jwtService = GetJwtService();
            var controller = new AuthController(context, jwtService);

            var dto = new RegisterUserDTO
            {
                Name = "Ana",
                LastName = "Test",
                BirthDay = DateTime.Now.AddYears(-22),
                Email = "ana@test.com",
                Password = "12345678",
                PhoneNumber = "7777",
                Gender = "F",
                Province = "SJ",
                Canton = "Central",
                District = "Carmen",
                ExactAddress = "Casa 2"
            };

            // Act
            var result = await controller.Register(dto);

            // Assert
            Assert.IsType<OkObjectResult>(result);
            Assert.Single(context.Users);
        }
    }
}
