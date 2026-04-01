using Xunit;
using backend_yenir.Models;
using backend_yenir.DTOs.ShoppingCart;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Linq;

namespace Test_Anthony_a_Dilan.ShoppingCar
{
    public class Edit_Tests : CartTestBase
    {
        [Fact]
        public async Task EditQuantity_ProductNotInCart_ReturnsBadRequest()
        {
            var context = GetDb();

            context.Products.Add(new Product
            {
                Id = 505,
                Name = "Teclado Mecánico",
                Img = "https://cdn.ejemplo.com/products/teclado-mecanico.png",
                Price = 34990.00m,
                Stock = 20
            });
            await context.SaveChangesAsync();

            context.ShoppingCarts.Add(new ShoppingCart { UserId = UserId, Total = 0m });
            await context.SaveChangesAsync();

            var controller = GetControllerWithUser(context, UserId);

            var dto = new EditQuantityProductDTO { ProductId = 505, Quantity = 2 };

            var result = await controller.EditQuantity(dto);

            var bad = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Debe existir el producto en el carrito", bad.Value);
        }

        [Fact]
        public async Task EditQuantity_QuantityGreaterThanStock_ReturnsBadRequest()
        {
            var context = GetDb();

            var product = new Product
            {
                Id = 606,
                Name = "SSD 1TB NVMe",
                Img = "https://cdn.ejemplo.com/products/ssd-1tb.png",
                Price = 58990.00m,
                Stock = 5
            };
            context.Products.Add(product);
            await context.SaveChangesAsync();

            var cart = new ShoppingCart { UserId = UserId, Total = 0m };
            context.ShoppingCarts.Add(cart);
            await context.SaveChangesAsync();

            context.ShoppingCartItems.Add(new ShoppingCartItem
            {
                ShoppingCartId = cart.Id,
                ProductId = product.Id,
                Quantity = 1,
                UnitPrice = product.Price,
                SubTotal = product.Price
            });
            await context.SaveChangesAsync();

            var controller = GetControllerWithUser(context, UserId);

            var dto = new EditQuantityProductDTO { ProductId = 606, Quantity = 10 };

            var result = await controller.EditQuantity(dto);

            var bad = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("La cantidad a modificar no puede ser mayor al Stock disponible", bad.Value);
        }

        [Fact]
        public async Task EditQuantity_Success_UpdatesQuantityAndSubtotal()
        {
            var context = GetDb();

            var product = new Product
            {
                Id = 707,
                Name = "Monitor 24'' Full HD",
                Img = "https://cdn.ejemplo.com/products/monitor-24.png",
                Price = 89990.00m,
                Stock = 12
            };
            context.Products.Add(product);
            await context.SaveChangesAsync();

            var cart = new ShoppingCart { UserId = UserId, Total = 0m };
            context.ShoppingCarts.Add(cart);
            await context.SaveChangesAsync();

            context.ShoppingCartItems.Add(new ShoppingCartItem
            {
                ShoppingCartId = cart.Id,
                ProductId = product.Id,
                Quantity = 1,
                UnitPrice = product.Price,
                SubTotal = product.Price
            });
            await context.SaveChangesAsync();

            var controller = GetControllerWithUser(context, UserId);

            var dto = new EditQuantityProductDTO { ProductId = 707, Quantity = 3 };

            var result = await controller.EditQuantity(dto);

            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Se ha actualizado correctamente la cantidad del producto", ok.Value);

            var item = context.ShoppingCartItems.First(i => i.ProductId == 707);
            Assert.Equal(3, item.Quantity);
            Assert.Equal(269970.00m, item.SubTotal);
        }

        [Fact]
        public async Task EditQuantity_ReturnsUnauthorized_WhenUserNotIdentified()
        {
            var context = GetDb();
            var controller = GetControllerWithoutUser(context);

            var dto = new EditQuantityProductDTO { ProductId = 707, Quantity = 2 };

            var result = await controller.EditQuantity(dto);

            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal("No se pudo indentificar el usuario", unauthorized.Value);
        }
    }
}
