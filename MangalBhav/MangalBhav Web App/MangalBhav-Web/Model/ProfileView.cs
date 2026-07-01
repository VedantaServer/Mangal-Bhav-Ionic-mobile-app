using System;
namespace FaceUPAI.Models
{
	public class ProfileView
	{
		#region Fields

		private int profileViewID;
		private int tenantID;
		private int panditUserID;
		private int viewedByUserID;
		private string iPAddress;
		private string device;
		private string source;
		private DateTime dateAdded;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the ProfileView class.
		/// </summary>
		public ProfileView()
		{
		}

		/// <summary>
		/// Initializes a new instance of the ProfileView class.
		/// </summary>
		public ProfileView(int tenantID, int panditUserID, int viewedByUserID, string iPAddress, string device, string source, DateTime dateAdded)
		{
			this.tenantID = tenantID;
			this.panditUserID = panditUserID;
			this.viewedByUserID = viewedByUserID;
			this.iPAddress = iPAddress;
			this.device = device;
			this.source = source;
			this.dateAdded = dateAdded;
		}

		/// <summary>
		/// Initializes a new instance of the ProfileView class.
		/// </summary>
		public ProfileView(int profileViewID, int tenantID, int panditUserID, int viewedByUserID, string iPAddress, string device, string source, DateTime dateAdded)
		{
			this.profileViewID = profileViewID;
			this.tenantID = tenantID;
			this.panditUserID = panditUserID;
			this.viewedByUserID = viewedByUserID;
			this.iPAddress = iPAddress;
			this.device = device;
			this.source = source;
			this.dateAdded = dateAdded;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the ProfileViewID value.
		/// </summary>
		public  int ProfileViewID
		{
			get { return profileViewID; }
			set { profileViewID = value; }
		}

		/// <summary>
		/// Gets or sets the TenantID value.
		/// </summary>
		public  int TenantID
		{
			get { return tenantID; }
			set { tenantID = value; }
		}

		/// <summary>
		/// Gets or sets the PanditUserID value.
		/// </summary>
		public  int PanditUserID
		{
			get { return panditUserID; }
			set { panditUserID = value; }
		}

		/// <summary>
		/// Gets or sets the ViewedByUserID value.
		/// </summary>
		public  int ViewedByUserID
		{
			get { return viewedByUserID; }
			set { viewedByUserID = value; }
		}

		/// <summary>
		/// Gets or sets the IPAddress value.
		/// </summary>
		public  string IPAddress
		{
			get { return iPAddress; }
			set { iPAddress = value; }
		}

		/// <summary>
		/// Gets or sets the Device value.
		/// </summary>
		public  string Device
		{
			get { return device; }
			set { device = value; }
		}

		/// <summary>
		/// Gets or sets the Source value.
		/// </summary>
		public  string Source
		{
			get { return source; }
			set { source = value; }
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
