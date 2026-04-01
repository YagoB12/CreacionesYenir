using backend_yenir.Controllers;
using backend_yenir.Data;
using backend_yenir.DTOs.Inventory;
using backend_yenir.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UpdateInventory.Tests
{
    [TestClass()]
    public class UpdateInventoryTests
    {
        private ApplicationDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var context = new ApplicationDbContext(options);
            return context;
        }

        [TestMethod]
        public async Task UpdateMaterial_ShouldUpdateSuccessfully()
        {
            // Arrange
            var context = GetDbContext();

            var material = new Inventory
            {
                Name = "Cemento",
                Descripcion = "Material viejo",
                Stock = 5
            };

            context.Inventories.Add(material);
            await context.SaveChangesAsync();

            var controller = new InvetoryController(context);

            var dto = new UpdateMaterialDTO
            {
                Name = "Cemento Nuevo",
                Description = "Material actualizado",
                Stock = 10
            };

            // Act
            var result = await controller.UpdateMaterial(material.Id, dto);

            // Assert
            Assert.IsInstanceOfType(result, typeof(OkObjectResult));

            var updatedMaterial = await context.Inventories.FindAsync(material.Id);

            Assert.AreEqual("Cemento Nuevo", updatedMaterial.Name);
            Assert.AreEqual("Material actualizado", updatedMaterial.Descripcion);
            Assert.AreEqual(10, updatedMaterial.Stock);
        }

        [TestMethod]
        public async Task UpdateMaterial_ShouldReturnNotFound_WhenMaterialDoesNotExist()
        {
            // Arrange
            var context = GetDbContext();
            var controller = new InvetoryController(context);

            var dto = new UpdateMaterialDTO
            {
                Name = "Nuevo",
                Stock = 5
            };

            // Act
            var result = await controller.UpdateMaterial(999, dto);

            // Assert
            Assert.IsInstanceOfType(result, typeof(NotFoundObjectResult));
        }

        [TestMethod]
        public async Task UpdateMaterial_ShouldReturnBadRequest_WhenStockIsNegative()
        {
            // Arrange
            var context = GetDbContext();

            var material = new Inventory
            {
                Name = "Hierro",
                Descripcion = "Material",
                Stock = 5
            };

            context.Inventories.Add(material);
            await context.SaveChangesAsync();

            var controller = new InvetoryController(context);

            var dto = new UpdateMaterialDTO
            {
                Stock = -5
            };

            // Act
            var result = await controller.UpdateMaterial(material.Id, dto);

            // Assert
            Assert.IsInstanceOfType(result, typeof(BadRequestObjectResult));
        }
    }
}