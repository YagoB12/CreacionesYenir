using Xunit;
using backend_yenir.Models;
using backend_yenir.DTOs.ShoppingCart;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Linq;

namespace Test_Anthony_a_Dilan.ShoppingCar
{
    public class Add_Tests : CartTestBase
    {
        [Fact]
        public async Task AddToCart_ReturnsBadRequest_WhenModelStateInvalid()
        {
            var context = GetDb();
            var controller = GetControllerWithUser(context, UserId);

            controller.ModelState.AddModelError("Quantity", "Required");

            var dto = new AddToCartDTO { ProductId = 101, Quantity = 1 };

            var result = await controller.AddToCart(dto);

            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task AddToCart_ReturnsUnauthorized_WhenUserNotIdentified()
        {
            var context = GetDb();
            var controller = GetControllerWithoutUser(context);

            var dto = new AddToCartDTO { ProductId = 101, Quantity = 1 };

            var result = await controller.AddToCart(dto);

            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal("Usuario no identificado", unauthorized.Value);
        }

        [Fact]
        public async Task AddToCart_ReturnsNotFound_WhenProductDoesNotExist()
        {
            var context = GetDb();
            var controller = GetControllerWithUser(context, UserId);

            var dto = new AddToCartDTO { ProductId = 9999, Quantity = 1 };

            var result = await controller.AddToCart(dto);

            var notFound = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("Producto no encontrado", notFound.Value);
        }

        [Fact]
        public async Task AddToCart_ReturnsBadRequest_WhenQuantityIsZero()
        {
            var context = GetDb();
            var controller = GetControllerWithUser(context, UserId);

            var dto = new AddToCartDTO { ProductId = 101, Quantity = 0 };

            var result = await controller.AddToCart(dto);

            var bad = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("La cantidad debe ser mayor a 0", bad.Value);
        }

        [Fact]
        public async Task AddToCart_ReturnsBadRequest_WhenStockInsufficient()
        {
            var context = GetDb();
            context.Products.Add(new Product
            {
                Id = 202,
                Name = "Audífonos Bluetooth",
                Img = "https://cdn.ejemplo.com/products/audifonos-bt.png",
                Price = 24500.00m,
                Stock = 2
            });
            await context.SaveChangesAsync();

            var controller = GetControllerWithUser(context, UserId);

            var dto = new AddToCartDTO { ProductId = 202, Quantity = 3 };

            var result = await controller.AddToCart(dto);

            var bad = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Stock insuficiente", bad.Value);
        }

        [Fact]
        public async Task AddToCart_AddsProductSuccessfully()
        {
            var context = GetDb();
            context.Products.Add(new Product
            {
                Id = 303,
                Name = "Mouse Gamer RGB",
                Img = "https://cdn.ejemplo.com/products/mouse-rgb.png",
                Price = 12990.99m,
                Stock = 15
            });
            await context.SaveChangesAsync();

            var controller = GetControllerWithUser(context, UserId);

            var dto = new AddToCartDTO { ProductId = 303, Quantity = 2 };

            var result = await controller.AddToCart(dto);

            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Producto agregado al carrito", ok.Value);

            Assert.Single(context.ShoppingCartItems);
            var item = context.ShoppingCartItems.First();
            Assert.Equal(2, item.Quantity);
            Assert.Equal(25981.98m, item.SubTotal);
        }

        [Fact]
        public async Task AddToCart_WhenItemAlreadyExists_IncrementsQuantity()
        {
            var context = GetDb();

            var product = new Product
            {
                Id = 404,
                Name = "Botella Térmica 1L",
                Img = "https://cdn.ejemplo.com/products/botella-1l.png",
                Price = 7990.00m,
                Stock = 50
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

            var dto = new AddToCartDTO { ProductId = 404, Quantity = 2 };

            var result = await controller.AddToCart(dto);

            Assert.IsType<OkObjectResult>(result);

            var updatedItem = context.ShoppingCartItems.First(i => i.ProductId == 404);
            Assert.Equal(3, updatedItem.Quantity);
            Assert.Equal(23970.00m, updatedItem.SubTotal);
        }
    }
}
