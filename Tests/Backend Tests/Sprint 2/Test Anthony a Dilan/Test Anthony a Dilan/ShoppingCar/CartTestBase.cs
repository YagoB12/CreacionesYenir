using backend_yenir.Controllers;
using backend_yenir.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Security.Claims;

namespace Test_Anthony_a_Dilan.ShoppingCar
{
    public abstract class CartTestBase
    {
        protected const int UserId = 17;

        protected ApplicationDbContext GetDb()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new ApplicationDbContext(options);
        }

        protected ShoppingCartController GetControllerWithUser(ApplicationDbContext context, int userId)
        {
            var controller = new ShoppingCartController(context);

            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString())
            }, "TestAuth"));

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            return controller;
        }

        protected ShoppingCartController GetControllerWithoutUser(ApplicationDbContext context)
        {
            var controller = new ShoppingCartController(context);
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };
            return controller;
        }
    }
}
