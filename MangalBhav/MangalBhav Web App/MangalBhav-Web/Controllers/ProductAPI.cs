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
	public class ProductAPI : ControllerBase
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
		/// Saves a record to the Product table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("ProductInsert")]
		public  IActionResult ProductInsert([FromBody] Product product)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ProductName", product.ProductName),
				new SqlParameter("@ShortDescription", product.ShortDescription),
				new SqlParameter("@Description", product.Description),
				new SqlParameter("@Category", product.Category),
				new SqlParameter("@SKU", product.SKU),
				new SqlParameter("@MRP", product.MRP),
				new SqlParameter("@SellingPrice", product.SellingPrice),
				new SqlParameter("@DiscountPercentage", product.DiscountPercentage),
				new SqlParameter("@Weight", product.Weight),
				new SqlParameter("@Length", product.Length),
				new SqlParameter("@Width", product.Width),
				new SqlParameter("@Height", product.Height),
				new SqlParameter("@StockQuantity", product.StockQuantity == 0 ? SqlInt32.Null : product.StockQuantity ),
				new SqlParameter("@MainImage", product.MainImage),
				new SqlParameter("@IsActive", product.IsActive),
				new SqlParameter("@DateAdded", product.DateAdded == DateTime.MinValue ? SqlDateTime.Null : product.DateAdded ),
				new SqlParameter("@DateModified", product.DateModified == DateTime.MinValue ? SqlDateTime.Null : product.DateModified )
			};

			product.ProductID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "ProductInsert", parameters));
			return Ok(new {ProductID=product.ProductID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the Product table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("ProductUpdate")]
		public  IActionResult ProductUpdate([FromBody] Product product)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ProductID", product.ProductID == 0 ? SqlInt32.Null : product.ProductID ),
				new SqlParameter("@ProductName", product.ProductName),
				new SqlParameter("@ShortDescription", product.ShortDescription),
				new SqlParameter("@Description", product.Description),
				new SqlParameter("@Category", product.Category),
				new SqlParameter("@SKU", product.SKU),
				new SqlParameter("@MRP", product.MRP),
				new SqlParameter("@SellingPrice", product.SellingPrice),
				new SqlParameter("@DiscountPercentage", product.DiscountPercentage),
				new SqlParameter("@Weight", product.Weight),
				new SqlParameter("@Length", product.Length),
				new SqlParameter("@Width", product.Width),
				new SqlParameter("@Height", product.Height),
				new SqlParameter("@StockQuantity", product.StockQuantity == 0 ? SqlInt32.Null : product.StockQuantity ),
				new SqlParameter("@MainImage", product.MainImage),
				new SqlParameter("@IsActive", product.IsActive),
				new SqlParameter("@DateAdded", product.DateAdded == DateTime.MinValue ? SqlDateTime.Null : product.DateAdded ),
				new SqlParameter("@DateModified", product.DateModified == DateTime.MinValue ? SqlDateTime.Null : product.DateModified )
			};

			 var ProductID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "ProductUpdate", parameters));
			return Ok(new {ProductID = ProductID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the Product table by its primary key.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("ProductDelete")]
		public  IActionResult ProductDelete(int productID, int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ProductID", productID)

				,new SqlParameter("@TenantID", tenantID)			};

			 var productDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "ProductDelete", parameters));
			return Ok(new {ProductID = productDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the Product table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("ProductSelect")]
		public IActionResult ProductSelect(int productID,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ProductID", productID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "ProductSelect", parameters))
			{
				List<Product> ProductList = new List<Product>();
				while (dataReader.Read())
				{
					Product Product = MakeProduct(dataReader);
					ProductList.Add(Product);
				}

				return  Ok(new {ProductList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the Product table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("ProductSelectAll")]
		public IActionResult ProductSelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "ProductSelectAll", parameters))
			{
				List<Product> ProductList = new List<Product>();
				while (dataReader.Read())
				{
					Product Product = MakeProduct(dataReader);
					ProductList.Add(Product);
				}

				return  Ok(new {ProductList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the Product table by a ak=ll query.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("ProductSelectByQuery")]
		public  IActionResult ProductSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "ProductSelectByQuery", parameters))
			{
				List<Product> ProductList = new List<Product>();
				while (dataReader.Read())
				{
					Product Product = MakeProduct(dataReader);
					ProductList.Add(Product);
				}

				return  Ok(new {ProductList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the Product class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  Product MakeProduct(SqlDataReader dataReader)
		{
			Product product = new Product();
			product.ProductID = DataAccess.GetInt32(dataReader, "ProductID", 0);
			product.ProductName = DataAccess.GetString(dataReader, "ProductName", String.Empty);
			product.ShortDescription = DataAccess.GetString(dataReader, "ShortDescription", String.Empty);
			product.Description = DataAccess.GetString(dataReader, "Description", String.Empty);
			product.Category = DataAccess.GetString(dataReader, "Category", String.Empty);
			product.SKU = DataAccess.GetString(dataReader, "SKU", String.Empty);
			product.MRP = DataAccess.GetDecimal(dataReader, "MRP", Decimal.Zero);
			product.SellingPrice = DataAccess.GetDecimal(dataReader, "SellingPrice", Decimal.Zero);
			product.DiscountPercentage = DataAccess.GetDecimal(dataReader, "DiscountPercentage", Decimal.Zero);
			product.Weight = DataAccess.GetDecimal(dataReader, "Weight", Decimal.Zero);
			product.Length = DataAccess.GetDecimal(dataReader, "Length", Decimal.Zero);
			product.Width = DataAccess.GetDecimal(dataReader, "Width", Decimal.Zero);
			product.Height = DataAccess.GetDecimal(dataReader, "Height", Decimal.Zero);
			product.StockQuantity = DataAccess.GetInt32(dataReader, "StockQuantity", 0);
			product.MainImage = DataAccess.GetString(dataReader, "MainImage", String.Empty);
			product.IsActive = DataAccess.GetBoolean(dataReader, "IsActive", false);
			product.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);
			product.DateModified = DataAccess.GetDateTime(dataReader, "DateModified", DateTime.MinValue);

			return product;
		}

	}
	}
