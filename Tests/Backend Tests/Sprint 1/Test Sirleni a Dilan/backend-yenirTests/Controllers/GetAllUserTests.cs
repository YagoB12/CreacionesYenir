using backend_yenir.Controllers;
using backend_yenir.Data;
using backend_yenir.Models.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend_yenir.Models;

using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace GetAllUser.Tests
{
    [TestClass()]
    public class GetAllUserTests
    {
        private ApplicationDbContext _context;
        private UserController _controller;

        [TestInitialize]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
            _controller = new UserController(_context);

            // Simular usuario ADMIN autenticado
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
        new Claim(ClaimTypes.Role, "ADMIN"),
        new Claim(ClaimTypes.NameIdentifier, "1")
            }, "TestAuth"));

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = user
                }
            };
        }
        // =========================
        // TEST: LIST USERS (GET ALL)
        // =========================
        [TestMethod]
        public async Task GetAll_ReturnsUsersList()
        {
            // ArrangeSimula la Agregacion de varios usuarios 
            _context.Users.AddRange(
                new User
                {
                    Name = "Admin",
                    LastName = "User",
                    Email = "admin@test.com",
                    PasswordHash = "hashed-password",
                    PhoneNumber = "8888-8888",
                    Gender = "Femenino",
                    Role = UserRole.ADMIN,
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    Name = "Cliente",
                    LastName = "User",
                    Email = "cliente@test.com",
                    PasswordHash = "hashed-password",
                    PhoneNumber = "8888-8888",
                    Gender = "Femenino",
                    Role = UserRole.CLIENT,
                    CreatedAt = DateTime.UtcNow
                }
            );
            //Se guarda
            await _context.SaveChangesAsync();

            // Act GEt:Simula obtener varios usuarios
            var result = await _controller.GetAll();

            // Assert
            var okResult = result as OkObjectResult;
            Assert.IsNotNull(okResult);//el r no sea nulo

            var json = JsonSerializer.Serialize(okResult.Value);
            var document = JsonDocument.Parse(json);
            //Cuanta cuantos usarios hay 
            var count = document.RootElement.GetProperty("count").GetInt32();
            //listar usuarios
            // Compara cuantos usarios hay y que haya 2
            Assert.AreEqual(2, count);
        }

    }
}
