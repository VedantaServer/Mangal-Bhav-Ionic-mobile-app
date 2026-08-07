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
	public class OrderDispatchAPI : ControllerBase
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
		/// Saves a record to the OrderDispatch table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("OrderDispatchInsert")]
		public  IActionResult OrderDispatchInsert([FromBody] OrderDispatch orderDispatch)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FK_OrderID", orderDispatch.FK_OrderID == 0 ? SqlInt32.Null : orderDispatch.FK_OrderID ),
				new SqlParameter("@CourierName", orderDispatch.CourierName),
				new SqlParameter("@TrackingNumber", orderDispatch.TrackingNumber),
				new SqlParameter("@AWBNumber", orderDispatch.AWBNumber),
				new SqlParameter("@DispatchDate", orderDispatch.DispatchDate == DateTime.MinValue ? SqlDateTime.Null : orderDispatch.DispatchDate ),
				new SqlParameter("@DeliveredDate", orderDispatch.DeliveredDate == DateTime.MinValue ? SqlDateTime.Null : orderDispatch.DeliveredDate ),
				new SqlParameter("@DispatchStatus", orderDispatch.DispatchStatus),
				new SqlParameter("@Remarks", orderDispatch.Remarks),
				new SqlParameter("@DateAdded", orderDispatch.DateAdded == DateTime.MinValue ? SqlDateTime.Null : orderDispatch.DateAdded )
			};

			orderDispatch.OrderDispatchID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "OrderDispatchInsert", parameters));
			return Ok(new {OrderDispatchID=orderDispatch.OrderDispatchID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the OrderDispatch table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("OrderDispatchUpdate")]
		public  IActionResult OrderDispatchUpdate([FromBody] OrderDispatch orderDispatch)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@OrderDispatchID", orderDispatch.OrderDispatchID == 0 ? SqlInt32.Null : orderDispatch.OrderDispatchID ),
				new SqlParameter("@FK_OrderID", orderDispatch.FK_OrderID == 0 ? SqlInt32.Null : orderDispatch.FK_OrderID ),
				new SqlParameter("@CourierName", orderDispatch.CourierName),
				new SqlParameter("@TrackingNumber", orderDispatch.TrackingNumber),
				new SqlParameter("@AWBNumber", orderDispatch.AWBNumber),
				new SqlParameter("@DispatchDate", orderDispatch.DispatchDate == DateTime.MinValue ? SqlDateTime.Null : orderDispatch.DispatchDate ),
				new SqlParameter("@DeliveredDate", orderDispatch.DeliveredDate == DateTime.MinValue ? SqlDateTime.Null : orderDispatch.DeliveredDate ),
				new SqlParameter("@DispatchStatus", orderDispatch.DispatchStatus),
				new SqlParameter("@Remarks", orderDispatch.Remarks),
				new SqlParameter("@DateAdded", orderDispatch.DateAdded == DateTime.MinValue ? SqlDateTime.Null : orderDispatch.DateAdded )
			};

			 var OrderDispatchID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "OrderDispatchUpdate", parameters));
			return Ok(new {OrderDispatchID = OrderDispatchID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the OrderDispatch table by its primary key.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("OrderDispatchDelete")]
		public  IActionResult OrderDispatchDelete(int orderDispatchID, int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@OrderDispatchID", orderDispatchID)

				,new SqlParameter("@TenantID", tenantID)			};

			 var orderDispatchDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "OrderDispatchDelete", parameters));
			return Ok(new {OrderDispatchID = orderDispatchDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the OrderDispatch table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("OrderDispatchSelect")]
		public IActionResult OrderDispatchSelect(int orderDispatchID,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@OrderDispatchID", orderDispatchID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "OrderDispatchSelect", parameters))
			{
				List<OrderDispatch> OrderDispatchList = new List<OrderDispatch>();
				while (dataReader.Read())
				{
					OrderDispatch OrderDispatch = MakeOrderDispatch(dataReader);
					OrderDispatchList.Add(OrderDispatch);
				}

				return  Ok(new {OrderDispatchList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the OrderDispatch table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("OrderDispatchSelectAll")]
		public IActionResult OrderDispatchSelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "OrderDispatchSelectAll", parameters))
			{
				List<OrderDispatch> OrderDispatchList = new List<OrderDispatch>();
				while (dataReader.Read())
				{
					OrderDispatch OrderDispatch = MakeOrderDispatch(dataReader);
					OrderDispatchList.Add(OrderDispatch);
				}

				return  Ok(new {OrderDispatchList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the OrderDispatch table by a foreign key.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("OrderDispatchSelectAllByFK_OrderID")]
		public  IActionResult OrderDispatchSelectAllByFK_OrderID(int fK_OrderID)
	{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FK_OrderID", fK_OrderID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "OrderDispatchSelectAllByFK_OrderID", parameters))
			{
				List<OrderDispatch> OrderDispatchList = new List<OrderDispatch>();
				while (dataReader.Read())
				{
					OrderDispatch OrderDispatch = MakeOrderDispatch(dataReader);
					OrderDispatchList.Add(OrderDispatch);
				}

				return  Ok(new {OrderDispatchList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the OrderDispatch table by a ak=ll query.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("OrderDispatchSelectByQuery")]
		public  IActionResult OrderDispatchSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "OrderDispatchSelectByQuery", parameters))
			{
				List<OrderDispatch> OrderDispatchList = new List<OrderDispatch>();
				while (dataReader.Read())
				{
					OrderDispatch OrderDispatch = MakeOrderDispatch(dataReader);
					OrderDispatchList.Add(OrderDispatch);
				}

				return  Ok(new {OrderDispatchList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the OrderDispatch class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  OrderDispatch MakeOrderDispatch(SqlDataReader dataReader)
		{
			OrderDispatch orderDispatch = new OrderDispatch();
			orderDispatch.OrderDispatchID = DataAccess.GetInt32(dataReader, "OrderDispatchID", 0);
			orderDispatch.FK_OrderID = DataAccess.GetInt32(dataReader, "FK_OrderID", 0);
			orderDispatch.CourierName = DataAccess.GetString(dataReader, "CourierName", String.Empty);
			orderDispatch.TrackingNumber = DataAccess.GetString(dataReader, "TrackingNumber", String.Empty);
			orderDispatch.AWBNumber = DataAccess.GetString(dataReader, "AWBNumber", String.Empty);
			orderDispatch.DispatchDate = DataAccess.GetDateTime(dataReader, "DispatchDate", DateTime.MinValue);
			orderDispatch.DeliveredDate = DataAccess.GetDateTime(dataReader, "DeliveredDate", DateTime.MinValue);
			orderDispatch.DispatchStatus = DataAccess.GetString(dataReader, "DispatchStatus", String.Empty);
			orderDispatch.Remarks = DataAccess.GetString(dataReader, "Remarks", String.Empty);
			orderDispatch.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);

			return orderDispatch;
		}

	}
	}
