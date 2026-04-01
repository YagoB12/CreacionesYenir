using Xunit;
using backend_yenir.Controllers;
using backend_yenir.Data;
using backend_yenir.DTOs.Auth;
using backend_yenir.Models;
using backend_yenir.Models.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace Test_de_Anthony_a_Diego.Controllers
{
    public class UserControllerTests
    {
        private ApplicationDbContext GetDb()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new ApplicationDbContext(options);
        }

        [Fact]
        public async Task Register_CreatesUser()
        {
            var context = GetDb();
            var controller = new UserController(context);

            var dto = new RegisterUserDTO
            {
                Name = "Juan",
                LastName = "Perez",
                BirthDay = DateTime.Now.AddYears(-20),
                Email = "juan@test.com",
                Password = "12345678",
                PhoneNumber = "88888888",
                Gender = "M",
                Province = "SJ",
                Canton = "Central",
                District = "Carmen",
                ExactAddress = "Casa 1"
            };

            var result = await controller.Register(dto);

            Assert.IsType<OkObjectResult>(result);
            Assert.Single(context.Users);
        }

        [Fact]
        public async Task UpdateUser_ChangesData()
        {
            var context = GetDb();
            context.Users.Add(new User
            {
                Id = 1,
                Name = "Old",
                LastName = "Name",
                Email = "old@test.com",
                PasswordHash = "hash",
                Role = UserRole.CLIENT,
                BirthDay = DateTime.Now.AddYears(-30), 
                PhoneNumber = "88888888",              
                Gender = "M"                       
            });
            await context.SaveChangesAsync();

            var controller = new UserController(context);

            var dto = new UpdateUserDTO
            {
                Name = "New",
                LastName = "Name",
                BirthDay = DateTime.Now.AddYears(-25),
                PhoneNumber = "9999",
                Gender = "M"
            };

            var result = await controller.UpdateUser(1, dto);

            Assert.IsType<OkObjectResult>(result);
            Assert.Equal("New", context.Users.First().Name);
        }

        [Fact]
        public async Task UpdateUserRole_ChangesRole()
        {
            // Arrange
            var context = GetDb();
            context.Users.Add(new User
            {
                Id = 1,
                Name = "User",
                LastName = "Test",
                BirthDay = DateTime.Now.AddYears(-25),
                Email = "user@test.com",
                PasswordHash = "hash",
                PhoneNumber = "77777777",
                Gender = "F",
                Province = "SJ",
                Canton = "Central",
                District = "Carmen",
                ExactAddress = "Casa",
                Role = UserRole.CLIENT
            });
            await context.SaveChangesAsync();

            var controller = new UserController(context);

            var dto = new UpdateUserRoleDTO
            {
                Role = UserRole.ADMIN
            };

            // Act
            var result = await controller.UpdateUserRole(1, dto);

            // Assert
            Assert.IsType<OkObjectResult>(result);
            Assert.Equal(UserRole.ADMIN, context.Users.First().Role);
        }

    }
}
