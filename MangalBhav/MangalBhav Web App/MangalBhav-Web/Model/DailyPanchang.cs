using System;
namespace FaceUPAI.Models
{
	public class DailyPanchang
	{
		#region Fields

		private int dailyPanchangID;
		private string sectionHeading;
		private string key1;
		private string value1;
		private DateTime panchangDate;
		private string language;
		private string location;
		private DateTime dateAdded;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the DailyPanchang class.
		/// </summary>
		public DailyPanchang()
		{
		}

		/// <summary>
		/// Initializes a new instance of the DailyPanchang class.
		/// </summary>
		public DailyPanchang(string sectionHeading, string key1, string value1, DateTime panchangDate, string language, string location, DateTime dateAdded)
		{
			this.sectionHeading = sectionHeading;
			this.key1 = key1;
			this.value1 = value1;
			this.panchangDate = panchangDate;
			this.language = language;
			this.location = location;
			this.dateAdded = dateAdded;
		}

		/// <summary>
		/// Initializes a new instance of the DailyPanchang class.
		/// </summary>
		public DailyPanchang(int dailyPanchangID, string sectionHeading, string key1, string value1, DateTime panchangDate, string language, string location, DateTime dateAdded)
		{
			this.dailyPanchangID = dailyPanchangID;
			this.sectionHeading = sectionHeading;
			this.key1 = key1;
			this.value1 = value1;
			this.panchangDate = panchangDate;
			this.language = language;
			this.location = location;
			this.dateAdded = dateAdded;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the DailyPanchangID value.
		/// </summary>
		public  int DailyPanchangID
		{
			get { return dailyPanchangID; }
			set { dailyPanchangID = value; }
		}

		/// <summary>
		/// Gets or sets the SectionHeading value.
		/// </summary>
		public  string SectionHeading
		{
			get { return sectionHeading; }
			set { sectionHeading = value; }
		}

		/// <summary>
		/// Gets or sets the Key1 value.
		/// </summary>
		public  string Key1
		{
			get { return key1; }
			set { key1 = value; }
		}

		/// <summary>
		/// Gets or sets the Value1 value.
		/// </summary>
		public  string Value1
		{
			get { return value1; }
			set { value1 = value; }
		}

		/// <summary>
		/// Gets or sets the PanchangDate value.
		/// </summary>
		public  DateTime PanchangDate
		{
			get { return panchangDate; }
			set { panchangDate = value; }
		}

		/// <summary>
		/// Gets or sets the Language value.
		/// </summary>
		public  string Language
		{
			get { return language; }
			set { language = value; }
		}

		/// <summary>
		/// Gets or sets the Location value.
		/// </summary>
		public  string Location
		{
			get { return location; }
			set { location = value; }
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
