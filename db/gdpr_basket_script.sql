CALL stp_upsertDimension('sys.type', 'basket', @bask_id);
INSERT INTO main_dimension_record VALUES (0, @bask_id, func_getDimensionID('sys.attr.desc'), 0);
CALL stp_upsertDimension('sys.type', 'item', @item_id);
INSERT INTO main_dimension_record VALUES (0, @item_id, func_getDimensionID('sys.attr.desc'), 0);
CALL stp_upsertDimension('sys.type', 'tag', @tag_id);
INSERT INTO main_dimension_record VALUES (0, @tag_id, func_getDimensionID('sys.attr.desc'), 0);

CALL stp_upsertRelation('sys.type.basket', 'sys.type.item', @bait_id);

drop temporary table if exists tmp_records;
create temporary table tmp_records
(
	tmp_id int unsigned not null auto_increment,
    tmp_dbid int unsigned not null default 0,
	tmp_basket varchar(10) not null,
	tmp_code varchar(45) not null,
	tmp_item_code varchar(45) not null,
	tmp_desc varchar(1000) not null,
	primary key (tmp_id)
);

insert into tmp_records values (0, 0, '1', '1a', 'IMS', 'Informeer medewerkers en sleutelfiguren');
insert into tmp_records values (0, 0, '2', '2a', 'DMM', 'Data mapping maken');
insert into tmp_records values (0, 0, '2', '2b', 'DMT', 'Data mapping toetsen');
insert into tmp_records values (0, 0, '2', '2c', 'VWA', 'Verwerkingsregister aanmaken');
insert into tmp_records values (0, 0, '2', '2d', 'VWT', 'Verwerkingsregister toetsen');
insert into tmp_records values (0, 0, '3', '3a', 'PBE', 'Privacybeleid evalueren');
insert into tmp_records values (0, 0, '3', '3b', 'PBO', 'Privacybeleid opstellen');
insert into tmp_records values (0, 0, '4', '4a', 'PUR', 'Procedures voor uitoefenen van rechten / opnemen in privacy-verklaring');
insert into tmp_records values (0, 0, '5', '5a', 'PVB', 'Privacy-verklaring bijwerken');
insert into tmp_records values (0, 0, '5', '5b', 'PVE', 'Privacy-verklaring evalueren');
insert into tmp_records values (0, 0, '6', '6a', 'TRG', 'Toetsen en registreren grondslag');
insert into tmp_records values (0, 0, '7', '7a', 'ETK', 'Evalueren toestemming binnen kaders AVG');
insert into tmp_records values (0, 0, '8', '8a', 'IPG', 'Inventariseer aanwezige PG en toestemming ouders');
insert into tmp_records values (0, 0, '9', '9a', 'OPDL', 'Opstellen procedure datalekken binnen kaders AVG');
insert into tmp_records values (0, 0, '9', '9b', 'TPDL', 'Toetsen procedure datalekken binnen kaders AVG');
insert into tmp_records values (0, 0, '9', '9c', 'PDL', 'Proces op datalekken');
insert into tmp_records values (0, 0, '10', '10a', 'DPIA', 'DPIA uitvoeren');
insert into tmp_records values (0, 0, '11', '11a', 'AFD', 'Aanstellen FG/DPO');
insert into tmp_records values (0, 0, '11', '11b', 'UFD', 'Uitwerken');
insert into tmp_records values (0, 0, '12', '12a', 'TZHA', 'De toezichthouder in het land van vestiging is aanspreekpunt');
insert into tmp_records values (0, 0, '12', '12b', 'TZHL', 'Stel vast welke toezichthouder de leidende is');
insert into tmp_records values (0, 0, '13', '13a', 'EVBO', 'Evalueren bestaande overeenkomsten');

CALL stp_upsertDimensionRecords('sys.type.item');

drop table if exists tmp_items;
create table tmp_items as select * from tmp_records;

INSERT INTO main_record_value
SELECT *
FROM
(
	SELECT
		0 AS mava_id,
		madr.madr_fk_record AS mava_fk_record,
		func_getDimensionID('sys.attr.desc') AS mava_fk_dimension,
		func_getDimensionID('sys.lang.nl') AS mava_fk_language,
		NULL,
		tmp_desc
	FROM tmp_items AS tmp
	JOIN main_dimension_record AS madr
	  ON madr.madr_id = tmp.tmp_dbid
) AS tmp
WHERE NOT EXISTS
	(SELECT 1 FROM main_record_value
		WHERE mava_fk_record = tmp.mava_fk_record
          AND mava_fk_dimension = tmp.mava_fk_dimension
          AND mava_fk_language = tmp.mava_fk_language
          AND mava_value = tmp.tmp_desc);

drop temporary table if exists tmp_records;
create temporary table tmp_records
(
	tmp_id int unsigned not null auto_increment,
    tmp_dbid int unsigned not null default 0,
	tmp_code varchar(45) not null,
	tmp_desc varchar(1000) not null,
	primary key (tmp_id)
);

insert into tmp_records values (0, 0, 'CB', 'Creëer Bewustwording');
insert into tmp_records values (0, 0, 'LP', 'Lokaliseer persoonsgegevens');
insert into tmp_records values (0, 0, 'PB', 'Privacy verklaring en beleid');
insert into tmp_records values (0, 0, 'RI', 'Rechten van individuen');
insert into tmp_records values (0, 0, 'VI', 'Voorbereiding Inzageverzoeken');
insert into tmp_records values (0, 0, 'WG', 'Wettelijke grondslag verwerken persoonsgegevens');
insert into tmp_records values (0, 0, 'ET', 'Evalueer toestemming');
insert into tmp_records values (0, 0, 'WK', 'Waak over kinderen');
insert into tmp_records values (0, 0, 'DL', 'Datalekken');
insert into tmp_records values (0, 0, 'IA', 'Privacy by design / DPIA Data Protection Impact Assessment');
insert into tmp_records values (0, 0, 'PO', 'FG/ DPO aanstellen Functionaris Gegevensbescherming / Data Protection Officer');
insert into tmp_records values (0, 0, 'IN', 'Internationaal');
insert into tmp_records values (0, 0, 'EV', 'Evaluatie');

CALL stp_upsertDimensionRecords('sys.type.basket');

INSERT INTO main_record_value
SELECT *
FROM
(
	SELECT
		0 AS mava_id,
		madr.madr_fk_record AS mava_fk_record,
		func_getDimensionID('sys.attr.desc') AS mava_fk_dimension,
		func_getDimensionID('sys.lang.nl') AS mava_fk_language,
		NULL,
		tmp_desc
	FROM tmp_records AS tmp
	JOIN main_dimension_record AS madr
	  ON madr.madr_id = tmp.tmp_dbid
) AS tmp
WHERE NOT EXISTS
	(SELECT 1 FROM main_record_value
		WHERE mava_fk_record = tmp.mava_fk_record
          AND mava_fk_dimension = tmp.mava_fk_dimension
          AND mava_fk_language = tmp.mava_fk_language
          AND mava_value = tmp.tmp_desc);
          
drop table if exists tmp_baskets;
create table tmp_baskets as select * from tmp_records;

drop temporary table if exists tmp_relations;
create temporary table tmp_relations
(
	tmp_id int unsigned not null auto_increment,
    tmp_dbid int unsigned not null default 0,
    tmp_relation int unsigned not null,
    tmp_fk_parent int unsigned not null,
	tmp_fk_child int unsigned not null,
    tmp_order int unsigned not null default 0,
	primary key (tmp_id)
);

insert into tmp_relations
select
	0 as tmp_id,
    0 as tmp_dbid,
    marr_fk_relation as tmp_relation,
	marr_fk_parent as tmp_fk_parent,
	marr_fk_child as tmp_fk_child,
    0 as tmp_order
from
(
	select
		b.tmp_dbid as marr_fk_parent,
		i.tmp_dbid as marr_fk_child
	from tmp_items as i
	join tmp_baskets as b
	  on b.tmp_id = i.tmp_basket
) as tmp
join
(
	select func_getRelationID('sys.type.basket', 'sys.type.item') as marr_fk_relation
) as rel
where not exists
	(select 1 from main_relation_record
		where marr_fk_relation = rel.marr_fk_relation
          and marr_fk_parent = tmp.marr_fk_parent
          and marr_fk_child = tmp.marr_fk_child);

CALL stp_upsertRelationRecords(0);
