using System;
namespace FaceUPAI.Models
{
	public class ProductOrder
	{
		#region Fields

		private int orderID;
		private string orderNo;
		private int fK_ProductID;
		private int quantity;
		private decimal unitPrice;
		private decimal subTotal;
		private decimal shippingCharge;
		private decimal discount;
		private decimal taxAmount;
		private decimal grandTotal;
		private int userID;
		private string customerName;
		private string mobileNumber;
		private string alternateMobile;
		private string email;
		private string address;
		private string landmark;
		private string city;
		private string state;
		private string pincode;
		private string paymentMethod;
		private string paymentStatus;
		private string orderStatus;
		private string orderRemarks;
		private DateTime expectedDeliveryDate;
		private DateTime dateAdded;
		private DateTime dateModified;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the ProductOrder class.
		/// </summary>
		public ProductOrder()
		{
		}

		/// <summary>
		/// Initializes a new instance of the ProductOrder class.
		/// </summary>
		public ProductOrder(string orderNo, int fK_ProductID, int quantity, decimal unitPrice, decimal subTotal, decimal shippingCharge, decimal discount, decimal taxAmount, decimal grandTotal, int userID, string customerName, string mobileNumber, string alternateMobile, string email, string address, string landmark, string city, string state, string pincode, string paymentMethod, string paymentStatus, string orderStatus, string orderRemarks, DateTime expectedDeliveryDate, DateTime dateAdded, DateTime dateModified)
		{
			this.orderNo = orderNo;
			this.fK_ProductID = fK_ProductID;
			this.quantity = quantity;
			this.unitPrice = unitPrice;
			this.subTotal = subTotal;
			this.shippingCharge = shippingCharge;
			this.discount = discount;
			this.taxAmount = taxAmount;
			this.grandTotal = grandTotal;
			this.userID = userID;
			this.customerName = customerName;
			this.mobileNumber = mobileNumber;
			this.alternateMobile = alternateMobile;
			this.email = email;
			this.address = address;
			this.landmark = landmark;
			this.city = city;
			this.state = state;
			this.pincode = pincode;
			this.paymentMethod = paymentMethod;
			this.paymentStatus = paymentStatus;
			this.orderStatus = orderStatus;
			this.orderRemarks = orderRemarks;
			this.expectedDeliveryDate = expectedDeliveryDate;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
		}

		/// <summary>
		/// Initializes a new instance of the ProductOrder class.
		/// </summary>
		public ProductOrder(int orderID, string orderNo, int fK_ProductID, int quantity, decimal unitPrice, decimal subTotal, decimal shippingCharge, decimal discount, decimal taxAmount, decimal grandTotal, int userID, string customerName, string mobileNumber, string alternateMobile, string email, string address, string landmark, string city, string state, string pincode, string paymentMethod, string paymentStatus, string orderStatus, string orderRemarks, DateTime expectedDeliveryDate, DateTime dateAdded, DateTime dateModified)
		{
			this.orderID = orderID;
			this.orderNo = orderNo;
			this.fK_ProductID = fK_ProductID;
			this.quantity = quantity;
			this.unitPrice = unitPrice;
			this.subTotal = subTotal;
			this.shippingCharge = shippingCharge;
			this.discount = discount;
			this.taxAmount = taxAmount;
			this.grandTotal = grandTotal;
			this.userID = userID;
			this.customerName = customerName;
			this.mobileNumber = mobileNumber;
			this.alternateMobile = alternateMobile;
			this.email = email;
			this.address = address;
			this.landmark = landmark;
			this.city = city;
			this.state = state;
			this.pincode = pincode;
			this.paymentMethod = paymentMethod;
			this.paymentStatus = paymentStatus;
			this.orderStatus = orderStatus;
			this.orderRemarks = orderRemarks;
			this.expectedDeliveryDate = expectedDeliveryDate;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the OrderID value.
		/// </summary>
		public  int OrderID
		{
			get { return orderID; }
			set { orderID = value; }
		}

		/// <summary>
		/// Gets or sets the OrderNo value.
		/// </summary>
		public  string OrderNo
		{
			get { return orderNo; }
			set { orderNo = value; }
		}

		/// <summary>
		/// Gets or sets the FK_ProductID value.
		/// </summary>
		public  int FK_ProductID
		{
			get { return fK_ProductID; }
			set { fK_ProductID = value; }
		}

		/// <summary>
		/// Gets or sets the Quantity value.
		/// </summary>
		public  int Quantity
		{
			get { return quantity; }
			set { quantity = value; }
		}

		/// <summary>
		/// Gets or sets the UnitPrice value.
		/// </summary>
		public  decimal UnitPrice
		{
			get { return unitPrice; }
			set { unitPrice = value; }
		}

		/// <summary>
		/// Gets or sets the SubTotal value.
		/// </summary>
		public  decimal SubTotal
		{
			get { return subTotal; }
			set { subTotal = value; }
		}

		/// <summary>
		/// Gets or sets the ShippingCharge value.
		/// </summary>
		public  decimal ShippingCharge
		{
			get { return shippingCharge; }
			set { shippingCharge = value; }
		}

		/// <summary>
		/// Gets or sets the Discount value.
		/// </summary>
		public  decimal Discount
		{
			get { return discount; }
			set { discount = value; }
		}

		/// <summary>
		/// Gets or sets the TaxAmount value.
		/// </summary>
		public  decimal TaxAmount
		{
			get { return taxAmount; }
			set { taxAmount = value; }
		}

		/// <summary>
		/// Gets or sets the GrandTotal value.
		/// </summary>
		public  decimal GrandTotal
		{
			get { return grandTotal; }
			set { grandTotal = value; }
		}

		/// <summary>
		/// Gets or sets the UserID value.
		/// </summary>
		public  int UserID
		{
			get { return userID; }
			set { userID = value; }
		}

		/// <summary>
		/// Gets or sets the CustomerName value.
		/// </summary>
		public  string CustomerName
		{
			get { return customerName; }
			set { customerName = value; }
		}

		/// <summary>
		/// Gets or sets the MobileNumber value.
		/// </summary>
		public  string MobileNumber
		{
			get { return mobileNumber; }
			set { mobileNumber = value; }
		}

		/// <summary>
		/// Gets or sets the AlternateMobile value.
		/// </summary>
		public  string AlternateMobile
		{
			get { return alternateMobile; }
			set { alternateMobile = value; }
		}

		/// <summary>
		/// Gets or sets the Email value.
		/// </summary>
		public  string Email
		{
			get { return email; }
			set { email = value; }
		}

		/// <summary>
		/// Gets or sets the Address value.
		/// </summary>
		public  string Address
		{
			get { return address; }
			set { address = value; }
		}

		/// <summary>
		/// Gets or sets the Landmark value.
		/// </summary>
		public  string Landmark
		{
			get { return landmark; }
			set { landmark = value; }
		}

		/// <summary>
		/// Gets or sets the City value.
		/// </summary>
		public  string City
		{
			get { return city; }
			set { city = value; }
		}

		/// <summary>
		/// Gets or sets the State value.
		/// </summary>
		public  string State
		{
			get { return state; }
			set { state = value; }
		}

		/// <summary>
		/// Gets or sets the Pincode value.
		/// </summary>
		public  string Pincode
		{
			get { return pincode; }
			set { pincode = value; }
		}

		/// <summary>
		/// Gets or sets the PaymentMethod value.
		/// </summary>
		public  string PaymentMethod
		{
			get { return paymentMethod; }
			set { paymentMethod = value; }
		}

		/// <summary>
		/// Gets or sets the PaymentStatus value.
		/// </summary>
		public  string PaymentStatus
		{
			get { return paymentStatus; }
			set { paymentStatus = value; }
		}

		/// <summary>
		/// Gets or sets the OrderStatus value.
		/// </summary>
		public  string OrderStatus
		{
			get { return orderStatus; }
			set { orderStatus = value; }
		}

		/// <summary>
		/// Gets or sets the OrderRemarks value.
		/// </summary>
		public  string OrderRemarks
		{
			get { return orderRemarks; }
			set { orderRemarks = value; }
		}

		/// <summary>
		/// Gets or sets the ExpectedDeliveryDate value.
		/// </summary>
		public  DateTime ExpectedDeliveryDate
		{
			get { return expectedDeliveryDate; }
			set { expectedDeliveryDate = value; }
		}

		/// <summary>
		/// Gets or sets the DateAdded value.
		/// </summary>
		public  DateTime DateAdded
		{
			get { return dateAdded; }
			set { dateAdded = value; }
		}

		/// <summary>
		/// Gets or sets the DateModified value.
		/// </summary>
		public  DateTime DateModified
		{
			get { return dateModified; }
			set { dateModified = value; }
		}

		#endregion
	}
}
