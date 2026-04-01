using backend_yenir.Controllers;
using backend_yenir.Data;
using backend_yenir.Models.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using backend_yenir.Models;


namespace DeleteUser.Tests
{
    [TestClass()]
    public class DeleteUserTests
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

            //  Simular usuario ADMIN autenticado
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
        // TEST: DELETE USER OK
        // =========================
        [TestMethod]
        public async Task DeleteUser_ReturnsOk_WhenUserExists()
        {
            // Arrange
            var user = new User
            {
                Name = "Usuario",
                LastName = "Eliminar",
                Email = "delete@test.com",
                PasswordHash = "hashed-password",
                PhoneNumber = "8888-8888",          
                Gender = "Femenino",
                Role = UserRole.CLIENT,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);//Simula una agragcion de usuario
            await _context.SaveChangesAsync();// Guarda el usuario simulado

            // Act
            var result = await _controller.DeleteUser(user.Id);//Simula la elimacion de un usuario

            // Assert Valida
            var okResult = result as OkObjectResult;
            Assert.IsNotNull(okResult);//Comprueba que no es nulo

            var deletedUser = await _context.Users.FindAsync(user.Id);//Simula la busqueda de un usuario elimnado
            Assert.IsNull(deletedUser);//Usuario tiene que ser vacio para comprobar que se elimino
        }
    
}
}