using Xunit;
using backend_yenir.DTOs.Inventory;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Linq;
using InventoryModel = backend_yenir.Models.Inventory;

namespace Test_Anthony_a_Dilan.Inventory
{
    public class Inventory_CreateMaterial_Tests : InventoryTestBase
    {
        [Fact]
        public async Task CreateMaterial_ReturnsBadRequest_WhenNameTooLong()
        {
            var context = GetDb();
            var controller = GetControllerAsAdmin(context);

            var dto = new CreateMaterialDTO
            {
                Name = new string('A', 101),
                Description = "Material de prueba",
                Stock = 10
            };

            var result = await controller.CreateMaterial(dto);

            var bad = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Se necesita que el material tenga por lo menos un nombre y que sea igual o menos a 100 digitos", bad.Value);
        }

        [Fact]
        public async Task CreateMaterial_ReturnsBadRequest_WhenStockIsNegative()
        {
            var context = GetDb();
            var controller = GetControllerAsAdmin(context);

            var dto = new CreateMaterialDTO
            {
                Name = "Barniz Poliuretano",
                Description = "Barniz para acabado brillante",
                Stock = -5
            };

            var result = await controller.CreateMaterial(dto);

            var bad = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("No se puede ingresar un número negativo", bad.Value);
        }

        [Fact]
        public async Task CreateMaterial_ReturnsBadRequest_WhenDescriptionTooLong()
        {
            var context = GetDb();
            var controller = GetControllerAsAdmin(context);

            var dto = new CreateMaterialDTO
            {
                Name = "Pegamento Industrial",
                Description = new string('X', 501),
                Stock = 25
            };

            var result = await controller.CreateMaterial(dto);

            var bad = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("La descripción debe ser igual o menor a 500 dígitos", bad.Value);
        }

        [Fact]
        public async Task CreateMaterial_ReturnsBadRequest_WhenNameAlreadyExists()
        {
            var context = GetDb();

            context.Inventories.Add(new InventoryModel
            {
                Name = "Tornillos 3/4",
                Descripcion = "Caja de 100 unidades",
                Stock = 120
            });

            await context.SaveChangesAsync();

            var controller = GetControllerAsAdmin(context);

            var dto = new CreateMaterialDTO
            {
                Name = "tornillos 3/4",
                Description = "Otro registro",
                Stock = 20
            };

            var result = await controller.CreateMaterial(dto);

            var bad = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("El nombre de material ingresado ya existe", bad.Value);
        }

        [Fact]
        public async Task CreateMaterial_CreatesSuccessfully()
        {
            var context = GetDb();
            var controller = GetControllerAsAdmin(context);

            var dto = new CreateMaterialDTO
            {
                Name = "Lija Grano 120",
                Description = "Lija para acabado fino en madera",
                Stock = 75
            };

            var result = await controller.CreateMaterial(dto);

            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(ok.Value);

            var saved = context.Inventories.FirstOrDefault(i => i.Name == "Lija Grano 120");

            Assert.NotNull(saved);
            Assert.Equal(75, saved!.Stock);
            Assert.Equal("Lija para acabado fino en madera", saved.Descripcion);
        }
    }
}
