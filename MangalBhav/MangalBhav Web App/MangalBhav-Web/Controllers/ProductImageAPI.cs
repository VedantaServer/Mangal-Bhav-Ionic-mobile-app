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
	public class ProductImageAPI : ControllerBase
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
		/// Saves a record to the ProductImage table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("ProductImageInsert")]
		public  IActionResult ProductImageInsert([FromBody] ProductImage productImage)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FK_ProductID", productImage.FK_ProductID == 0 ? SqlInt32.Null : productImage.FK_ProductID ),
				new SqlParameter("@ImageURL", productImage.ImageURL),
				new SqlParameter("@DisplayOrder", productImage.DisplayOrder == 0 ? SqlInt32.Null : productImage.DisplayOrder ),
				new SqlParameter("@DateAdded", productImage.DateAdded == DateTime.MinValue ? SqlDateTime.Null : productImage.DateAdded )
			};

			productImage.ProductImageID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "ProductImageInsert", parameters));
			return Ok(new {ProductImageID=productImage.ProductImageID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the ProductImage table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("ProductImageUpdate")]
		public  IActionResult ProductImageUpdate([FromBody] ProductImage productImage)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ProductImageID", productImage.ProductImageID == 0 ? SqlInt32.Null : productImage.ProductImageID ),
				new SqlParameter("@FK_ProductID", productImage.FK_ProductID == 0 ? SqlInt32.Null : productImage.FK_ProductID ),
				new SqlParameter("@ImageURL", productImage.ImageURL),
				new SqlParameter("@DisplayOrder", productImage.DisplayOrder == 0 ? SqlInt32.Null : productImage.DisplayOrder ),
				new SqlParameter("@DateAdded", productImage.DateAdded == DateTime.MinValue ? SqlDateTime.Null : productImage.DateAdded )
			};

			 var ProductImageID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "ProductImageUpdate", parameters));
			return Ok(new {ProductImageID = ProductImageID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the ProductImage table by its primary key.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("ProductImageDelete")]
		public  IActionResult ProductImageDelete(int productImageID, int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ProductImageID", productImageID)

				,new SqlParameter("@TenantID", tenantID)			};

			 var productImageDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "ProductImageDelete", parameters));
			return Ok(new {ProductImageID = productImageDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the ProductImage table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("ProductImageSelect")]
		public IActionResult ProductImageSelect(int productImageID,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ProductImageID", productImageID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "ProductImageSelect", parameters))
			{
				List<ProductImage> ProductImageList = new List<ProductImage>();
				while (dataReader.Read())
				{
					ProductImage ProductImage = MakeProductImage(dataReader);
					ProductImageList.Add(ProductImage);
				}

				return  Ok(new {ProductImageList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the ProductImage table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("ProductImageSelectAll")]
		public IActionResult ProductImageSelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "ProductImageSelectAll", parameters))
			{
				List<ProductImage> ProductImageList = new List<ProductImage>();
				while (dataReader.Read())
				{
					ProductImage ProductImage = MakeProductImage(dataReader);
					ProductImageList.Add(ProductImage);
				}

				return  Ok(new {ProductImageList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the ProductImage table by a foreign key.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("ProductImageSelectAllByFK_ProductID")]
		public  IActionResult ProductImageSelectAllByFK_ProductID(int fK_ProductID)
	{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FK_ProductID", fK_ProductID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "ProductImageSelectAllByFK_ProductID", parameters))
			{
				List<ProductImage> ProductImageList = new List<ProductImage>();
				while (dataReader.Read())
				{
					ProductImage ProductImage = MakeProductImage(dataReader);
					ProductImageList.Add(ProductImage);
				}

				return  Ok(new {ProductImageList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the ProductImage table by a ak=ll query.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("ProductImageSelectByQuery")]
		public  IActionResult ProductImageSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "ProductImageSelectByQuery", parameters))
			{
				List<ProductImage> ProductImageList = new List<ProductImage>();
				while (dataReader.Read())
				{
					ProductImage ProductImage = MakeProductImage(dataReader);
					ProductImageList.Add(ProductImage);
				}

				return  Ok(new {ProductImageList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the ProductImage class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  ProductImage MakeProductImage(SqlDataReader dataReader)
		{
			ProductImage productImage = new ProductImage();
			productImage.ProductImageID = DataAccess.GetInt32(dataReader, "ProductImageID", 0);
			productImage.FK_ProductID = DataAccess.GetInt32(dataReader, "FK_ProductID", 0);
			productImage.ImageURL = DataAccess.GetString(dataReader, "ImageURL", String.Empty);
			productImage.DisplayOrder = DataAccess.GetInt32(dataReader, "DisplayOrder", 0);
			productImage.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);

			return productImage;
		}

	}
	}
