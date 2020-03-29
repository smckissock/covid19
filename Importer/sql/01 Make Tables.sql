	USE Covid19
GO



--CREATE PROCEDURE [dbo].[DropTable](@table AS varchar(500)) 
--AS
--BEGIN
--	DECLARE @sql nvarchar(500)
--	SET @sql = 'IF OBJECT_ID(''' + @table + ''', ''U'') IS NOT NULL BEGIN DROP TABLE ' + @table + ' END'
--	EXEC sp_executesql @sql
--END	
--GO

	
--CREATE PROCEDURE [dbo].[DropView](@view AS varchar(500)) 
--AS
--BEGIN
--	DECLARE @sql nvarchar(500)
--	SET @sql = 'IF OBJECT_ID(''' + @view + ''', ''V'') IS NOT NULL BEGIN DROP VIEW ' + @view + ' END'
--	EXEC sp_executesql @sql
--END	
--GO


EXEC DropTable 'Metric'
GO
EXEC DropTable 'MetricType'
GO
EXEC DropTable 'City'
GO
EXEC DropTable 'State'
GO
EXEC DropTable 'Country'
GO



CREATE TABLE Country (
	ID [int] IDENTITY(1,1) NOT NULL,
	Name nvarchar(200) NOT NULL DEFAULT '', 
	Lat nvarchar(20) NOT NULL DEFAULT '',
	Long nvarchar(20) NOT NULL DEFAULT ''
PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

CREATE UNIQUE INDEX CountryName ON Country (Name);
GO

INSERT INTO Country VALUES ('N/A', '', '');
GO

CREATE TABLE State (
	ID [int] IDENTITY(1,1) NOT NULL,
	CountryID int NOT NULL REFERENCES Country(ID),
	Name nvarchar(200) NOT NULL DEFAULT '',
	Lat nvarchar(20) NOT NULL DEFAULT '',
	Long nvarchar(20) NOT NULL DEFAULT ''
PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

CREATE UNIQUE INDEX StateName ON State (CountryID, Name);
GO


INSERT INTO State VALUES (1, 'N/A', '', '');
GO


CREATE TABLE City (
	ID [int] IDENTITY(1,1) NOT NULL,
	StateID int NOT NULL REFERENCES State(ID),
	Name nvarchar(200) NOT NULL DEFAULT '',
	Lat nvarchar(20) NOT NULL DEFAULT '',
	Long nvarchar(20) NOT NULL DEFAULT ''
PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

CREATE UNIQUE INDEX CityName ON City (StateID, Name);
GO


INSERT INTO City VALUES (1, 'N/A', '', '');
GO


CREATE TABLE MetricType (
	ID [int] IDENTITY(1,1) NOT NULL,
	Name nvarchar(200) NOT NULL
PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


INSERT INTO MetricType VALUES ('Confirmed');
INSERT INTO MetricType VALUES ('Deaths');
INSERT INTO MetricType VALUES ('Recovered');
GO


CREATE TABLE Metric (
	ID [int] IDENTITY(1,1) NOT NULL,
	CountryID int NOT NULL REFERENCES Country(ID),
	StateID int NOT NULL REFERENCES State(ID),
	CityID int NOT NULL REFERENCES City(ID),
	MetricTypeID int NOT NULL REFERENCES MetricType(ID),
	Date Date NOT NULL,
	MetricCount int NOT NULL
PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

CREATE UNIQUE INDEX MetricUnique ON Metric (CountryID, CityID, StateID, Date, MetricTypeID);
GO


GO


CREATE OR ALTER VIEW MetricView
AS

SELECT 
	a.Country,
	a.State,
	a.City,
	a.Date,
	SUM(a.Confirmed) Confirmed,
	SUM(a.Deaths) Deaths,
	SUM(a.Recovered) Recovered
FROM 
(
SELECT
	c.Name Country,
	s.Name State,
	cy.Name City,
	m.Date,
	CASE WHEN m.MetricTypeID = 1 THEN m.MetricCount ELSE 0 END Confirmed,
	CASE WHEN m.MetricTypeID = 2 THEN m.MetricCount ELSE 0 END Deaths,
	CASE WHEN m.MetricTypeID = 3 THEN m.MetricCount ELSE 0 END Recovered
FROM Metric m
JOIN Country c ON m.CountryID = c.ID
JOIN State s ON m.StateID = s.ID
JOIN City cy ON m.CityID = cy.ID
) a
GROUP BY 
	a.Country,
	a.State,
	a.City,
	a.Date



--SELECT 
--	SUM(Confirmed) 
--FROM MetricView m
--WHERE m.Country = 'Canada'
--AND Date = '2020-03-13'


--SELECT MAX(Date) FROM Metric


--SELECT COuntry, State, Date, Confirmed, Deaths, Recovered FROM MetricView