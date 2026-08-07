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
	public class OrderFeedbackAPI : ControllerBase
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
		/// Saves a record to the OrderFeedback table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("OrderFeedbackInsert")]
		public  IActionResult OrderFeedbackInsert([FromBody] OrderFeedback orderFeedback)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FK_OrderID", orderFeedback.FK_OrderID == 0 ? SqlInt32.Null : orderFeedback.FK_OrderID ),
				new SqlParameter("@CustomerName", orderFeedback.CustomerName),
				new SqlParameter("@Rating", orderFeedback.Rating == 0 ? SqlInt32.Null : orderFeedback.Rating ),
				new SqlParameter("@ReviewTitle", orderFeedback.ReviewTitle),
				new SqlParameter("@Review", orderFeedback.Review),
				new SqlParameter("@ImageURL", orderFeedback.ImageURL),
				new SqlParameter("@IsApproved", orderFeedback.IsApproved),
				new SqlParameter("@DateAdded", orderFeedback.DateAdded == DateTime.MinValue ? SqlDateTime.Null : orderFeedback.DateAdded )
			};

			orderFeedback.OrderFeedbackID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "OrderFeedbackInsert", parameters));
			return Ok(new {OrderFeedbackID=orderFeedback.OrderFeedbackID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the OrderFeedback table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("OrderFeedbackUpdate")]
		public  IActionResult OrderFeedbackUpdate([FromBody] OrderFeedback orderFeedback)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@OrderFeedbackID", orderFeedback.OrderFeedbackID == 0 ? SqlInt32.Null : orderFeedback.OrderFeedbackID ),
				new SqlParameter("@FK_OrderID", orderFeedback.FK_OrderID == 0 ? SqlInt32.Null : orderFeedback.FK_OrderID ),
				new SqlParameter("@CustomerName", orderFeedback.CustomerName),
				new SqlParameter("@Rating", orderFeedback.Rating == 0 ? SqlInt32.Null : orderFeedback.Rating ),
				new SqlParameter("@ReviewTitle", orderFeedback.ReviewTitle),
				new SqlParameter("@Review", orderFeedback.Review),
				new SqlParameter("@ImageURL", orderFeedback.ImageURL),
				new SqlParameter("@IsApproved", orderFeedback.IsApproved),
				new SqlParameter("@DateAdded", orderFeedback.DateAdded == DateTime.MinValue ? SqlDateTime.Null : orderFeedback.DateAdded )
			};

			 var OrderFeedbackID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "OrderFeedbackUpdate", parameters));
			return Ok(new {OrderFeedbackID = OrderFeedbackID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the OrderFeedback table by its primary key.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("OrderFeedbackDelete")]
		public  IActionResult OrderFeedbackDelete(int orderFeedbackID, int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@OrderFeedbackID", orderFeedbackID)

				,new SqlParameter("@TenantID", tenantID)			};

			 var orderFeedbackDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "OrderFeedbackDelete", parameters));
			return Ok(new {OrderFeedbackID = orderFeedbackDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the OrderFeedback table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("OrderFeedbackSelect")]
		public IActionResult OrderFeedbackSelect(int orderFeedbackID,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@OrderFeedbackID", orderFeedbackID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "OrderFeedbackSelect", parameters))
			{
				List<OrderFeedback> OrderFeedbackList = new List<OrderFeedback>();
				while (dataReader.Read())
				{
					OrderFeedback OrderFeedback = MakeOrderFeedback(dataReader);
					OrderFeedbackList.Add(OrderFeedback);
				}

				return  Ok(new {OrderFeedbackList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the OrderFeedback table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("OrderFeedbackSelectAll")]
		public IActionResult OrderFeedbackSelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "OrderFeedbackSelectAll", parameters))
			{
				List<OrderFeedback> OrderFeedbackList = new List<OrderFeedback>();
				while (dataReader.Read())
				{
					OrderFeedback OrderFeedback = MakeOrderFeedback(dataReader);
					OrderFeedbackList.Add(OrderFeedback);
				}

				return  Ok(new {OrderFeedbackList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the OrderFeedback table by a foreign key.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("OrderFeedbackSelectAllByFK_OrderID")]
		public  IActionResult OrderFeedbackSelectAllByFK_OrderID(int fK_OrderID)
	{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FK_OrderID", fK_OrderID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "OrderFeedbackSelectAllByFK_OrderID", parameters))
			{
				List<OrderFeedback> OrderFeedbackList = new List<OrderFeedback>();
				while (dataReader.Read())
				{
					OrderFeedback OrderFeedback = MakeOrderFeedback(dataReader);
					OrderFeedbackList.Add(OrderFeedback);
				}

				return  Ok(new {OrderFeedbackList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the OrderFeedback table by a ak=ll query.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("OrderFeedbackSelectByQuery")]
		public  IActionResult OrderFeedbackSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "OrderFeedbackSelectByQuery", parameters))
			{
				List<OrderFeedback> OrderFeedbackList = new List<OrderFeedback>();
				while (dataReader.Read())
				{
					OrderFeedback OrderFeedback = MakeOrderFeedback(dataReader);
					OrderFeedbackList.Add(OrderFeedback);
				}

				return  Ok(new {OrderFeedbackList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the OrderFeedback class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  OrderFeedback MakeOrderFeedback(SqlDataReader dataReader)
		{
			OrderFeedback orderFeedback = new OrderFeedback();
			orderFeedback.OrderFeedbackID = DataAccess.GetInt32(dataReader, "OrderFeedbackID", 0);
			orderFeedback.FK_OrderID = DataAccess.GetInt32(dataReader, "FK_OrderID", 0);
			orderFeedback.CustomerName = DataAccess.GetString(dataReader, "CustomerName", String.Empty);
			orderFeedback.Rating = DataAccess.GetInt32(dataReader, "Rating", 0);
			orderFeedback.ReviewTitle = DataAccess.GetString(dataReader, "ReviewTitle", String.Empty);
			orderFeedback.Review = DataAccess.GetString(dataReader, "Review", String.Empty);
			orderFeedback.ImageURL = DataAccess.GetString(dataReader, "ImageURL", String.Empty);
			orderFeedback.IsApproved = DataAccess.GetBoolean(dataReader, "IsApproved", false);
			orderFeedback.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);

			return orderFeedback;
		}

	}
	}
