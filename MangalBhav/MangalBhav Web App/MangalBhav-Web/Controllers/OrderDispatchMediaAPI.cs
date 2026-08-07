using FaceUPAI.Controllers.Common;
using FaceUPAI.DataAccessService;
using FaceUPAI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlTypes;

namespace FaceUPAI.API
{
	public class OrderDispatchMediaAPI : ControllerBase
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
		/// Saves a record to the OrderDispatchMedia table.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("OrderDispatchMediaInsert")]
		public  IActionResult OrderDispatchMediaInsert([FromBody] OrderDispatchMedia orderDispatchMedia)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FK_OrderDispatchID", orderDispatchMedia.FK_OrderDispatchID == 0 ? SqlInt32.Null : orderDispatchMedia.FK_OrderDispatchID ),
				new SqlParameter("@MediaURL", orderDispatchMedia.MediaURL),
				new SqlParameter("@MediaType", orderDispatchMedia.MediaType),
				new SqlParameter("@DisplayOrder", orderDispatchMedia.DisplayOrder == 0 ? SqlInt32.Null : orderDispatchMedia.DisplayOrder ),
				new SqlParameter("@Caption", orderDispatchMedia.Caption),
				new SqlParameter("@DateAdded", orderDispatchMedia.DateAdded == DateTime.MinValue ? SqlDateTime.Null : orderDispatchMedia.DateAdded ),
				new SqlParameter("@UpdatedByUser", orderDispatchMedia.UpdatedByUser == 0 ? SqlInt32.Null : orderDispatchMedia.UpdatedByUser )
			};

			orderDispatchMedia.OrderDispatchMediaID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "OrderDispatchMediaInsert", parameters));
			return Ok(new {OrderDispatchMediaID=orderDispatchMedia.OrderDispatchMediaID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the OrderDispatchMedia table.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("OrderDispatchMediaUpdate")]
		public  IActionResult OrderDispatchMediaUpdate([FromBody] OrderDispatchMedia orderDispatchMedia)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@OrderDispatchMediaID", orderDispatchMedia.OrderDispatchMediaID == 0 ? SqlInt32.Null : orderDispatchMedia.OrderDispatchMediaID ),
				new SqlParameter("@FK_OrderDispatchID", orderDispatchMedia.FK_OrderDispatchID == 0 ? SqlInt32.Null : orderDispatchMedia.FK_OrderDispatchID ),
				new SqlParameter("@MediaURL", orderDispatchMedia.MediaURL),
				new SqlParameter("@MediaType", orderDispatchMedia.MediaType),
				new SqlParameter("@DisplayOrder", orderDispatchMedia.DisplayOrder == 0 ? SqlInt32.Null : orderDispatchMedia.DisplayOrder ),
				new SqlParameter("@Caption", orderDispatchMedia.Caption),
				new SqlParameter("@DateAdded", orderDispatchMedia.DateAdded == DateTime.MinValue ? SqlDateTime.Null : orderDispatchMedia.DateAdded ),
				new SqlParameter("@UpdatedByUser", orderDispatchMedia.UpdatedByUser == 0 ? SqlInt32.Null : orderDispatchMedia.UpdatedByUser )
			};

			 var OrderDispatchMediaID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "OrderDispatchMediaUpdate", parameters));
			return Ok(new {OrderDispatchMediaID = OrderDispatchMediaID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the OrderDispatchMedia table by its primary key.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("OrderDispatchMediaDelete")]
		public  IActionResult OrderDispatchMediaDelete(int orderDispatchMediaID, int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@OrderDispatchMediaID", orderDispatchMediaID)

				,new SqlParameter("@TenantID", tenantID)			};

			 var orderDispatchMediaDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "OrderDispatchMediaDelete", parameters));
			return Ok(new {OrderDispatchMediaID = orderDispatchMediaDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the OrderDispatchMedia table.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("OrderDispatchMediaSelect")]
		public IActionResult OrderDispatchMediaSelect(int orderDispatchMediaID,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@OrderDispatchMediaID", orderDispatchMediaID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "OrderDispatchMediaSelect", parameters))
			{
				List<OrderDispatchMedia> OrderDispatchMediaList = new List<OrderDispatchMedia>();
				while (dataReader.Read())
				{
					OrderDispatchMedia OrderDispatchMedia = MakeOrderDispatchMedia(dataReader);
					OrderDispatchMediaList.Add(OrderDispatchMedia);
				}

				return  Ok(new {OrderDispatchMediaList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the OrderDispatchMedia table.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("OrderDispatchMediaSelectAll")]
		public IActionResult OrderDispatchMediaSelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "OrderDispatchMediaSelectAll", parameters))
			{
				List<OrderDispatchMedia> OrderDispatchMediaList = new List<OrderDispatchMedia>();
				while (dataReader.Read())
				{
					OrderDispatchMedia OrderDispatchMedia = MakeOrderDispatchMedia(dataReader);
					OrderDispatchMediaList.Add(OrderDispatchMedia);
				}

				return  Ok(new {OrderDispatchMediaList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the OrderDispatchMedia table by a foreign key.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("OrderDispatchMediaSelectAllByFK_OrderDispatchID")]
		public  IActionResult OrderDispatchMediaSelectAllByFK_OrderDispatchID(int fK_OrderDispatchID)
	{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FK_OrderDispatchID", fK_OrderDispatchID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "OrderDispatchMediaSelectAllByFK_OrderDispatchID", parameters))
			{
				List<OrderDispatchMedia> OrderDispatchMediaList = new List<OrderDispatchMedia>();
				while (dataReader.Read())
				{
					OrderDispatchMedia OrderDispatchMedia = MakeOrderDispatchMedia(dataReader);
					OrderDispatchMediaList.Add(OrderDispatchMedia);
				}

				return  Ok(new {OrderDispatchMediaList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the OrderDispatchMedia table by a ak=ll query.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("OrderDispatchMediaSelectByQuery")]
		public  IActionResult OrderDispatchMediaSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "OrderDispatchMediaSelectByQuery", parameters))
			{
				List<OrderDispatchMedia> OrderDispatchMediaList = new List<OrderDispatchMedia>();
				while (dataReader.Read())
				{
					OrderDispatchMedia OrderDispatchMedia = MakeOrderDispatchMedia(dataReader);
					OrderDispatchMediaList.Add(OrderDispatchMedia);
				}

				return  Ok(new {OrderDispatchMediaList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the OrderDispatchMedia class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  OrderDispatchMedia MakeOrderDispatchMedia(SqlDataReader dataReader)
		{
			OrderDispatchMedia orderDispatchMedia = new OrderDispatchMedia();
			orderDispatchMedia.OrderDispatchMediaID = DataAccess.GetInt32(dataReader, "OrderDispatchMediaID", 0);
			orderDispatchMedia.FK_OrderDispatchID = DataAccess.GetInt32(dataReader, "FK_OrderDispatchID", 0);
			orderDispatchMedia.MediaURL = DataAccess.GetString(dataReader, "MediaURL", String.Empty);
			orderDispatchMedia.MediaType = DataAccess.GetString(dataReader, "MediaType", String.Empty);
			orderDispatchMedia.DisplayOrder = DataAccess.GetInt32(dataReader, "DisplayOrder", 0);
			orderDispatchMedia.Caption = DataAccess.GetString(dataReader, "Caption", String.Empty);
			orderDispatchMedia.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);
			orderDispatchMedia.UpdatedByUser = DataAccess.GetInt32(dataReader, "UpdatedByUser", 0);

			return orderDispatchMedia;
		}

	}
	}
