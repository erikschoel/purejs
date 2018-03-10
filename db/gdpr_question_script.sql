CALL stp_upsertDimension('sys.attr', 'answer', @answer_id);
CALL stp_upsertDimension('sys.type', 'question', @ques_id);
CALL stp_upsertRecordValue(@ques_id, func_getDimensionID('sys.attr.value'), 'sys', 'attr.answer', 0, @val_id);
-- INSERT INTO main_dimension_record VALUES (0, @ques_id, @options_id, 0);
INSERT INTO main_dimension_record VALUES (0, @ques_id, func_getDimensionID('sys.attr.type'), 0);
INSERT INTO main_dimension_record VALUES (0, @ques_id, func_getDimensionID('sys.attr.code'), 0);
INSERT INTO main_dimension_record VALUES (0, @ques_id, func_getDimensionID('sys.attr.desc'), 0);
INSERT INTO main_dimension_record VALUES (0, @ques_id, func_getDimensionID('sys.attr.tag'), 0);

CALL stp_upsertRelation('sys.type.entity', 'sys.type.question', @bait_id);
INSERT INTO main_dimension_record VALUES (0, @bait_id, func_getDimensionID('sys.attr.answer'), 0);

drop temporary table if exists tmp_records;
create temporary table tmp_records
(
	tmp_id int unsigned not null auto_increment,
	tmp_dbid int unsigned null,
    tmp_code varchar(45) not null,
	tmp_cat varchar(100) not null,
	tmp_desc varchar(255) not null,
    primary key (tmp_id)
);

insert into tmp_records values (0, 0, 'ques-01', 'Algemeen', 'Wat voor soort organisatie bent u?');
insert into tmp_records values (0, 0, 'ques-02', 'Algemeen', 'Hoeveel medewerkers heeft uw organisatie?');
insert into tmp_records values (0, 0, 'ques-03', 'Algemeen', 'Van hoeveel personen (klanten / medewerkers) verzamelt u de persoongegevens?');
insert into tmp_records values (0, 0, 'ques-04', 'Algemeen', 'Welke persoonsgegevens verzamelt uw organisatie?');
insert into tmp_records values (0, 0, 'ques-05', 'Algemeen', 'Welke bijzondere gegevens verzamelt uw organisatie?');
insert into tmp_records values (0, 0, 'ques-06', 'Wettelijke grondslag', 'Wat is de reden dat u persoonlijke gegevens verwerkt?');
insert into tmp_records values (0, 0, 'ques-07', 'Privacy verklaring en beleid', 'Heeft uw organisatie een privacy-beleid?');
insert into tmp_records values (0, 0, 'ques-08', 'Creëer Bewustwording', 'Zijn uw medewerkers op de hoogte van uw privacy-beleid?');
insert into tmp_records values (0, 0, 'ques-09', 'Lokaliseer persoonsgegevens', 'Weet u waar uw organisatie persoonsgegevens bewaart?');
insert into tmp_records values (0, 0, 'ques-10', 'Lokaliseer persoonsgegevens', 'Gebruikt uw organisatie een dataregister waarin verwerking van persoongegevens worden bijgehouden?');
insert into tmp_records values (0, 0, 'ques-11', 'Rechten van individuen', 'Welke rechten kunnen uw klanten eenvoudig uitoefenen? ');
insert into tmp_records values (0, 0, 'ques-12', 'Voorbereiden inzageverzoeken', 'Heeft u individuen geïnformeerd over hun rechten?');
insert into tmp_records values (0, 0, 'ques-13', 'Evalueer toestemming', 'Heeft u ondubbelzinnige toestemming gevraagd voor verwerking?');
insert into tmp_records values (0, 0, 'ques-14', 'Waak over kinderen', 'Werkt uw organisatie met de persoonsgegevens van kinderen?');
insert into tmp_records values (0, 0, 'ques-15', 'Technische beveiliging', 'Hoe heeft uw organisatie persoonsgegevens technisch beveiligd? ');
insert into tmp_records values (0, 0, 'ques-16', 'Privacy by design', 'Beperkt u de persoongegevens die u van individuen verwerkt tot een minimum');
insert into tmp_records values (0, 0, 'ques-17', 'Datalekken', 'Heeft uw organisatie een procedure datalekken?');
insert into tmp_records values (0, 0, 'ques-18', 'FG / DPO', 'Heeft u organisatie een Functionaris Gegevensbescherming aangesteld?');
insert into tmp_records values (0, 0, 'ques-19', 'Juridische documentatie', 'Heeft u met uw leveranciers van software en cloud-servers verwerkingsovereenkomsten opgesteld?');
insert into tmp_records values (0, 0, 'ques-20', 'Internationaal ', 'Is uw organisatie in meerdere EU lidstaten actief?');

CALL stp_upsertDimensionRecords('sys.type.question');

UPDATE main_record_value AS mava
	JOIN
	(
		SELECT
			0 AS mava_id,
			madr.madr_fk_record AS mava_fk_record,
			func_getDimensionID('sys.attr.desc') AS mava_fk_dimension,
			func_getDimensionID('sys.lang.nl') AS mava_fk_language,
			tmp_desc
		FROM tmp_records AS tmp
		JOIN main_dimension_record AS madr
		  ON madr.madr_id = tmp.tmp_dbid
	) AS tmp
	ON tmp.mava_fk_record = mava.mava_fk_record
	AND tmp.mava_fk_dimension = mava.mava_fk_dimension
	AND tmp.mava_fk_language = mava.mava_fk_language
SET mava.mava_value = tmp.tmp_desc;

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
          AND mava_fk_language = tmp.mava_fk_language);

/*
select *
from tmp_records as tmp
join main_dimension_record as madr
  on madr.madr_id = tmp.tmp_dbid
join main_record_value as mava
  on mava.mava_fk_record = madr.madr_fk_record
 and mava.mava_fk_dimension = func_getDimensionID('sys.attr.desc')
 and mava.mava_fk_language = func_getDimensionID('sys.lang.nl');
*/

drop table if exists tmp_questions;
create table tmp_questions as select * from tmp_records;

/*
select *
from tmp_questions
join main_dimension_record
  on madr_id = tmp_dbid
join main_record_value
  on mava_fk_record = madr_fk_record
*/
CALL stp_upsertDimension('sys.type', 'program', @prog_id);
INSERT INTO main_dimension_record VALUES (0, @prog_id, func_getDimensionID('sys.attr.desc'), 0);
CALL stp_upsertDimensionRecord('sys.type.program', 'INTK', @prog_id);
CALL stp_upsertDimensionRecordValue(@prog_id, 'sys.attr.desc', 'sys.lang.nl', 'Intake', FALSE, @prog_desc_id);

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

CALL stp_upsertRelation('sys.type.program', 'sys.type.question', @prog_ques_id);

insert into tmp_relations
select
	0 as tmp_id,
    0 as tmp_dbid,
    fk_relation as tmp_relation,
	@prog_id as tmp_fk_parent,
	madr_id as tmp_fk_child,
    0 as tmp_order
from
(
	select madr_id
	from main_dimension_record
	join main_record_value
	  on mava_fk_record = madr_fk_record
	 and mava_fk_dimension = func_getDimensionID('sys.attr.desc')
	 and mava_fk_language = func_getDimensionID('sys.lang.nl')
	where madr_fk_dimension = func_getDimensionID('sys.type.question')
) as tmp
join
(
	select func_getRelationID('sys.type.program', 'sys.type.question') as fk_relation
) as rel
where not exists
	(select 1 from main_relation_record
		where marr_fk_relation = rel.fk_relation
          and marr_fk_parent = @prog_id
          and marr_fk_child = tmp.madr_id);

update tmp_relations set tmp_order = tmp_id;

CALL stp_upsertRelationRecords(0);
