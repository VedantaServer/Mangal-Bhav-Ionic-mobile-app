using System;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using Microsoft.Data.SqlClient;
using System.Data.SqlTypes;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;
using FaceUPAI.Models;
using FaceUPAI.DataAccessService;
using FaceUPAI.Controllers.Common;
using Microsoft.AspNetCore.Cors;

namespace FaceUPAI.API
{
	public class ProductOrderAPI : ControllerBase
	{
	public IActionResult Index()
	{
	return View();
	}
	private IActionResult View()
	{
	throw new NotImplementedException();
	}
		/// <summary>
		/// Saves a record to the ProductOrder table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("ProductOrderInsert")]
		public  IActionResult ProductOrderInsert([FromBody] ProductOrder productOrder)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@OrderNo", productOrder.OrderNo),
				new SqlParameter("@FK_ProductID", productOrder.FK_ProductID == 0 ? SqlInt32.Null : productOrder.FK_ProductID ),
				new SqlParameter("@Quantity", productOrder.Quantity == 0 ? SqlInt32.Null : productOrder.Quantity ),
				new SqlParameter("@UnitPrice", productOrder.UnitPrice),
				new SqlParameter("@SubTotal", productOrder.SubTotal),
				new SqlParameter("@ShippingCharge", productOrder.ShippingCharge),
				new SqlParameter("@Discount", productOrder.Discount),
				new SqlParameter("@TaxAmount", productOrder.TaxAmount),
				new SqlParameter("@GrandTotal", productOrder.GrandTotal),
				new SqlParameter("@UserID", productOrder.UserID == 0 ? SqlInt32.Null : productOrder.UserID ),
				new SqlParameter("@CustomerName", productOrder.CustomerName),
				new SqlParameter("@MobileNumber", productOrder.MobileNumber),
				new SqlParameter("@AlternateMobile", productOrder.AlternateMobile),
				new SqlParameter("@Email", productOrder.Email),
				new SqlParameter("@Address", productOrder.Address),
				new SqlParameter("@Landmark", productOrder.Landmark),
				new SqlParameter("@City", productOrder.City),
				new SqlParameter("@State", productOrder.State),
				new SqlParameter("@Pincode", productOrder.Pincode),
				new SqlParameter("@PaymentMethod", productOrder.PaymentMethod),
				new SqlParameter("@PaymentStatus", productOrder.PaymentStatus),
				new SqlParameter("@OrderStatus", productOrder.OrderStatus),
				new SqlParameter("@OrderRemarks", productOrder.OrderRemarks),
				new SqlParameter("@ExpectedDeliveryDate", productOrder.ExpectedDeliveryDate == DateTime.MinValue ? SqlDateTime.Null : productOrder.ExpectedDeliveryDate ),
				new SqlParameter("@DateAdded", productOrder.DateAdded == DateTime.MinValue ? SqlDateTime.Null : productOrder.DateAdded ),
				new SqlParameter("@DateModified", productOrder.DateModified == DateTime.MinValue ? SqlDateTime.Null : productOrder.DateModified )
			};

			productOrder.OrderID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "ProductOrderInsert", parameters));
			return Ok(new {OrderID=productOrder.OrderID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the ProductOrder table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("ProductOrderUpdate")]
		public  IActionResult ProductOrderUpdate([FromBody] ProductOrder productOrder)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@OrderID", productOrder.OrderID == 0 ? SqlInt32.Null : productOrder.OrderID ),
				new SqlParameter("@OrderNo", productOrder.OrderNo),
				new SqlParameter("@FK_ProductID", productOrder.FK_ProductID == 0 ? SqlInt32.Null : productOrder.FK_ProductID ),
				new SqlParameter("@Quantity", productOrder.Quantity == 0 ? SqlInt32.Null : productOrder.Quantity ),
				new SqlParameter("@UnitPrice", productOrder.UnitPrice),
				new SqlParameter("@SubTotal", productOrder.SubTotal),
				new SqlParameter("@ShippingCharge", productOrder.ShippingCharge),
				new SqlParameter("@Discount", productOrder.Discount),
				new SqlParameter("@TaxAmount", productOrder.TaxAmount),
				new SqlParameter("@GrandTotal", productOrder.GrandTotal),
				new SqlParameter("@UserID", productOrder.UserID == 0 ? SqlInt32.Null : productOrder.UserID ),
				new SqlParameter("@CustomerName", productOrder.CustomerName),
				new SqlParameter("@MobileNumber", productOrder.MobileNumber),
				new SqlParameter("@AlternateMobile", productOrder.AlternateMobile),
				new SqlParameter("@Email", productOrder.Email),
				new SqlParameter("@Address", productOrder.Address),
				new SqlParameter("@Landmark", productOrder.Landmark),
				new SqlParameter("@City", productOrder.City),
				new SqlParameter("@State", productOrder.State),
				new SqlParameter("@Pincode", productOrder.Pincode),
				new SqlParameter("@PaymentMethod", productOrder.PaymentMethod),
				new SqlParameter("@PaymentStatus", productOrder.PaymentStatus),
				new SqlParameter("@OrderStatus", productOrder.OrderStatus),
				new SqlParameter("@OrderRemarks", productOrder.OrderRemarks),
				new SqlParameter("@ExpectedDeliveryDate", productOrder.ExpectedDeliveryDate == DateTime.MinValue ? SqlDateTime.Null : productOrder.ExpectedDeliveryDate ),
				new SqlParameter("@DateAdded", productOrder.DateAdded == DateTime.MinValue ? SqlDateTime.Null : productOrder.DateAdded ),
				new SqlParameter("@DateModified", productOrder.DateModified == DateTime.MinValue ? SqlDateTime.Null : productOrder.DateModified )
			};

			 var OrderID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "ProductOrderUpdate", parameters));
			return Ok(new {OrderID = OrderID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the ProductOrder table by its primary key.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("ProductOrderDelete")]
		public  IActionResult ProductOrderDelete(int orderID, int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@OrderID", orderID)

				,new SqlParameter("@TenantID", tenantID)			};

			 var productOrderDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "ProductOrderDelete", parameters));
			return Ok(new {OrderID = productOrderDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the ProductOrder table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("ProductOrderSelect")]
		public IActionResult ProductOrderSelect(int orderID,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@OrderID", orderID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "ProductOrderSelect", parameters))
			{
				List<ProductOrder> ProductOrderList = new List<ProductOrder>();
				while (dataReader.Read())
				{
					ProductOrder ProductOrder = MakeProductOrder(dataReader);
					ProductOrderList.Add(ProductOrder);
				}

				return  Ok(new {ProductOrderList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the ProductOrder table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("ProductOrderSelectAll")]
		public IActionResult ProductOrderSelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "ProductOrderSelectAll", parameters))
			{
				List<ProductOrder> ProductOrderList = new List<ProductOrder>();
				while (dataReader.Read())
				{
					ProductOrder ProductOrder = MakeProductOrder(dataReader);
					ProductOrderList.Add(ProductOrder);
				}

				return  Ok(new {ProductOrderList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the ProductOrder table by a foreign key.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("ProductOrderSelectAllByFK_ProductID")]
		public  IActionResult ProductOrderSelectAllByFK_ProductID(int fK_ProductID)
	{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FK_ProductID", fK_ProductID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "ProductOrderSelectAllByFK_ProductID", parameters))
			{
				List<ProductOrder> ProductOrderList = new List<ProductOrder>();
				while (dataReader.Read())
				{
					ProductOrder ProductOrder = MakeProductOrder(dataReader);
					ProductOrderList.Add(ProductOrder);
				}

				return  Ok(new {ProductOrderList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the ProductOrder table by a ak=ll query.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("ProductOrderSelectByQuery")]
		public  IActionResult ProductOrderSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "ProductOrderSelectByQuery", parameters))
			{
				List<ProductOrder> ProductOrderList = new List<ProductOrder>();
				while (dataReader.Read())
				{
					ProductOrder ProductOrder = MakeProductOrder(dataReader);
					ProductOrderList.Add(ProductOrder);
				}

				return  Ok(new {ProductOrderList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the ProductOrder class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  ProductOrder MakeProductOrder(SqlDataReader dataReader)
		{
			ProductOrder productOrder = new ProductOrder();
			productOrder.OrderID = DataAccess.GetInt32(dataReader, "OrderID", 0);
			productOrder.OrderNo = DataAccess.GetString(dataReader, "OrderNo", String.Empty);
			productOrder.FK_ProductID = DataAccess.GetInt32(dataReader, "FK_ProductID", 0);
			productOrder.Quantity = DataAccess.GetInt32(dataReader, "Quantity", 0);
			productOrder.UnitPrice = DataAccess.GetDecimal(dataReader, "UnitPrice", Decimal.Zero);
			productOrder.SubTotal = DataAccess.GetDecimal(dataReader, "SubTotal", Decimal.Zero);
			productOrder.ShippingCharge = DataAccess.GetDecimal(dataReader, "ShippingCharge", Decimal.Zero);
			productOrder.Discount = DataAccess.GetDecimal(dataReader, "Discount", Decimal.Zero);
			productOrder.TaxAmount = DataAccess.GetDecimal(dataReader, "TaxAmount", Decimal.Zero);
			productOrder.GrandTotal = DataAccess.GetDecimal(dataReader, "GrandTotal", Decimal.Zero);
			productOrder.UserID = DataAccess.GetInt32(dataReader, "UserID", 0);
			productOrder.CustomerName = DataAccess.GetString(dataReader, "CustomerName", String.Empty);
			productOrder.MobileNumber = DataAccess.GetString(dataReader, "MobileNumber", String.Empty);
			productOrder.AlternateMobile = DataAccess.GetString(dataReader, "AlternateMobile", String.Empty);
			productOrder.Email = DataAccess.GetString(dataReader, "Email", String.Empty);
			productOrder.Address = DataAccess.GetString(dataReader, "Address", String.Empty);
			productOrder.Landmark = DataAccess.GetString(dataReader, "Landmark", String.Empty);
			productOrder.City = DataAccess.GetString(dataReader, "City", String.Empty);
			productOrder.State = DataAccess.GetString(dataReader, "State", String.Empty);
			productOrder.Pincode = DataAccess.GetString(dataReader, "Pincode", String.Empty);
			productOrder.PaymentMethod = DataAccess.GetString(dataReader, "PaymentMethod", String.Empty);
			productOrder.PaymentStatus = DataAccess.GetString(dataReader, "PaymentStatus", String.Empty);
			productOrder.OrderStatus = DataAccess.GetString(dataReader, "OrderStatus", String.Empty);
			productOrder.OrderRemarks = DataAccess.GetString(dataReader, "OrderRemarks", String.Empty);
			productOrder.ExpectedDeliveryDate = DataAccess.GetDateTime(dataReader, "ExpectedDeliveryDate", DateTime.MinValue);
			productOrder.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);
			productOrder.DateModified = DataAccess.GetDateTime(dataReader, "DateModified", DateTime.MinValue);

			return productOrder;
		}

	}
	}
