using Xunit;
using backend_yenir.Controllers;
using backend_yenir.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Linq;
using InventoryModel = backend_yenir.Models.Inventory;

namespace Test_Anthony_a_Dilan.Inventory
{
    public class Inventory_Delete_Tests
    {
        private ApplicationDbContext GetDb()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new ApplicationDbContext(options);
        }

        private InvetoryController GetControllerAsAdmin(ApplicationDbContext context)
        {
            var controller = new InvetoryController(context);

            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "1"),
                new Claim(ClaimTypes.Role, "ADMIN"),
            }, "TestAuth"));

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            return controller;
        }

        // ============================
        // DELETE MATERIAL - No existe
        // ============================
        [Fact]
        public async Task DeleteMaterial_ReturnsNotFound_WhenMaterialDoesNotExist()
        {
            // Arrange
            var context = GetDb();
            var controller = GetControllerAsAdmin(context);

            // Act
            var result = await controller.DeleteMaterial(999);

            // Assert
            var notFound = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("El material no se encuentra en la base de datos", notFound.Value);
        }

        // ============================
        // DELETE MATERIAL - Eliminación exitosa
        // ============================
        [Fact]
        public async Task DeleteMaterial_DeletesSuccessfully()
        {
            // Arrange
            var context = GetDb();

            var material = new InventoryModel
            {
                Name = "Pintura Acrílica Blanca 1L",
                Descripcion = "Pintura base agua interior",
                Stock = 40
            };

            context.Inventories.Add(material);
            await context.SaveChangesAsync();

            var controller = GetControllerAsAdmin(context);

            // Act
            var result = await controller.DeleteMaterial(material.Id);

            // Assert
            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Se eliminó correctamente el material del inventario", ok.Value);

            Assert.Empty(context.Inventories);
        }

        // ============================
        // DELETE MATERIAL - Solo elimina el indicado
        // ============================
        [Fact]
        public async Task DeleteMaterial_DeletesOnlyTargetMaterial_WhenMultipleExist()
        {
            // Arrange
            var context = GetDb();

            var m1 = new InventoryModel
            {
                Name = "Lija Grano 120",
                Descripcion = "Lija para acabado fino",
                Stock = 75
            };

            var m2 = new InventoryModel
            {
                Name = "Pegamento Industrial",
                Descripcion = "Pegamento para madera",
                Stock = 20
            };

            context.Inventories.AddRange(m1, m2);
            await context.SaveChangesAsync();

            var controller = GetControllerAsAdmin(context);

            // Act
            var result = await controller.DeleteMaterial(m1.Id);

            // Assert
            Assert.IsType<OkObjectResult>(result);

            var remaining = context.Inventories.ToList();
            Assert.Single(remaining);
            Assert.Equal(m2.Name, remaining[0].Name);
        }
    }
}
