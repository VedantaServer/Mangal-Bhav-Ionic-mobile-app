using System;
namespace FaceUPAI.Models
{
	public class OrderDispatch
	{
		#region Fields

		private int orderDispatchID;
		private int fK_OrderID;
		private string courierName;
		private string trackingNumber;
		private string aWBNumber;
		private DateTime dispatchDate;
		private DateTime deliveredDate;
		private string dispatchStatus;
		private string remarks;
		private DateTime dateAdded;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the OrderDispatch class.
		/// </summary>
		public OrderDispatch()
		{
		}

		/// <summary>
		/// Initializes a new instance of the OrderDispatch class.
		/// </summary>
		public OrderDispatch(int fK_OrderID, string courierName, string trackingNumber, string aWBNumber, DateTime dispatchDate, DateTime deliveredDate, string dispatchStatus, string remarks, DateTime dateAdded)
		{
			this.fK_OrderID = fK_OrderID;
			this.courierName = courierName;
			this.trackingNumber = trackingNumber;
			this.aWBNumber = aWBNumber;
			this.dispatchDate = dispatchDate;
			this.deliveredDate = deliveredDate;
			this.dispatchStatus = dispatchStatus;
			this.remarks = remarks;
			this.dateAdded = dateAdded;
		}

		/// <summary>
		/// Initializes a new instance of the OrderDispatch class.
		/// </summary>
		public OrderDispatch(int orderDispatchID, int fK_OrderID, string courierName, string trackingNumber, string aWBNumber, DateTime dispatchDate, DateTime deliveredDate, string dispatchStatus, string remarks, DateTime dateAdded)
		{
			this.orderDispatchID = orderDispatchID;
			this.fK_OrderID = fK_OrderID;
			this.courierName = courierName;
			this.trackingNumber = trackingNumber;
			this.aWBNumber = aWBNumber;
			this.dispatchDate = dispatchDate;
			this.deliveredDate = deliveredDate;
			this.dispatchStatus = dispatchStatus;
			this.remarks = remarks;
			this.dateAdded = dateAdded;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the OrderDispatchID value.
		/// </summary>
		public  int OrderDispatchID
		{
			get { return orderDispatchID; }
			set { orderDispatchID = value; }
		}

		/// <summary>
		/// Gets or sets the FK_OrderID value.
		/// </summary>
		public  int FK_OrderID
		{
			get { return fK_OrderID; }
			set { fK_OrderID = value; }
		}

		/// <summary>
		/// Gets or sets the CourierName value.
		/// </summary>
		public  string CourierName
		{
			get { return courierName; }
			set { courierName = value; }
		}

		/// <summary>
		/// Gets or sets the TrackingNumber value.
		/// </summary>
		public  string TrackingNumber
		{
			get { return trackingNumber; }
			set { trackingNumber = value; }
		}

		/// <summary>
		/// Gets or sets the AWBNumber value.
		/// </summary>
		public  string AWBNumber
		{
			get { return aWBNumber; }
			set { aWBNumber = value; }
		}

		/// <summary>
		/// Gets or sets the DispatchDate value.
		/// </summary>
		public  DateTime DispatchDate
		{
			get { return dispatchDate; }
			set { dispatchDate = value; }
		}

		/// <summary>
		/// Gets or sets the DeliveredDate value.
		/// </summary>
		public  DateTime DeliveredDate
		{
			get { return deliveredDate; }
			set { deliveredDate = value; }
		}

		/// <summary>
		/// Gets or sets the DispatchStatus value.
		/// </summary>
		public  string DispatchStatus
		{
			get { return dispatchStatus; }
			set { dispatchStatus = value; }
		}

		/// <summary>
		/// Gets or sets the Remarks value.
		/// </summary>
		public  string Remarks
		{
			get { return remarks; }
			set { remarks = value; }
		}

		/// <summary>
		/// Gets or sets the DateAdded value.
		/// </summary>
		public  DateTime DateAdded
		{
			get { return dateAdded; }
			set { dateAdded = value; }
		}

		#endregion
	}
}
