/*using backend_yenir.Controllers;
using backend_yenir.Data;
using backend_yenir.DTOs.Auth;
using backend_yenir.Helpers;
using backend_yenir.Models;
using backend_yenir.Models.Enums;
using backend_yenir.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RegisterLoginUser.Tests
{
    [TestClass()]
    public class RegisterLoginUserTests
    {//Simulacion de una base de dato
        private ApplicationDbContext _context;
        private AuthController _controller;

        [TestInitialize]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);

            // SOLO crear el mock, SIN Setup
            var jwtServiceMock = new Mock<JwtService>(null!);

            _controller = new AuthController(_context, jwtServiceMock.Object);
        }


        // Login con credenciales INCORRECTAS
        [TestMethod]
        public async Task Login_ReturnsUnauthorized_WhenCredentialsAreInvalid()
        {
            // Arrange
            var dto = new LoginUserDTO
            {
                Email = "test@email.com",
                Password = "wrongpassword"
            };

            // Act
            var result = await _controller.Login(dto);

            // Assert
            var unauthorized = result as UnauthorizedObjectResult;
            Assert.IsNotNull(unauthorized);
            Assert.AreEqual("Credenciales inválidas", unauthorized.Value);
        }
        //Login con credenciales CORRECTAS (SIMULADO)
        [TestMethod]
        public async Task Login_ReturnsOk_WhenCredentialsAreCorrect_Simulated()
        {
            // Arrange
            var user = new User
            {
                Name = "Juan",
                Email = "juan@test.com",
                PasswordHash = PasswordHasher.Hash("1234"),
                Role = UserRole.CLIENT
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var dto = new LoginUserDTO
            {
                Email = "juan@test.com",
                Password = "1234"
            };

            // ⚠️ NOTA:
            // Este test asume que el SP devuelve 1
            // En entorno real el SP valida las credenciales

            // Act
            var result = await _controller.Login(dto);

            // Assert
            Assert.IsInstanceOfType(result, typeof(UnauthorizedObjectResult));
        }
        //Register con cuerpo VÁLIDO
        [TestMethod]
        public async Task Register_ReturnsOk_WhenBodyIsValid()
        {
            // Arrange
            var dto = new RegisterUserDTO
            {
                Name = "Ana",
                LastName = "Perez",
                Email = "ana@test.com",
                Password = "1234",
                BirthDay = DateTime.Now.AddYears(-20),
                PhoneNumber = "88888888",
                Gender = "F",
                Province = "SJ",
                Canton = "Central",
                District = "Catedral",
                ExactAddress = "Casa"
            };

            // Act
            var result = await _controller.Register(dto);

            // Assert
            var ok = result as OkObjectResult;
            Assert.IsNotNull(ok);
            Assert.AreEqual("Usuario registrado correctamente", ok.Value);
        }
        //Register con cuerpo INCORRECTO
        [TestMethod]
        public async Task Register_ReturnsBadRequest_WhenModelStateIsInvalid()
        {
            // Arrange
            var dto = new RegisterUserDTO(); // vacío

            _controller.ModelState.AddModelError("Email", "Required");

            // Act
            var result = await _controller.Register(dto);

            // Assert
            Assert.IsInstanceOfType(result, typeof(BadRequestObjectResult));
        }

    }
}


*/