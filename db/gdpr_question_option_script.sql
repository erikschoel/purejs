-- use purejs_db;

drop table if exists tmp_question_option;
create table tmp_question_option
(
	tmp_id int not null auto_increment,
	tmp_question int not null,
	tmp_type varchar(45) not null,
	tmp_option varchar(1000) not null,
	tmp_item varchar(45) not null,
	primary key (tmp_id)
);

insert into tmp_question_option values (0, 1, 'choice', 'Overheidsorganisatie', '11a');
insert into tmp_question_option values (0, 1, 'choice', 'Overheidsorganisatie', '2c');
insert into tmp_question_option values (0, 1, 'choice', 'Bedrijf wat data verzamelt van personen (verantwoordelijke)', '');
insert into tmp_question_option values (0, 1, 'choice', 'Bedrijf wat persoonsgegevens verder verwerkt (verwerker)', '');
insert into tmp_question_option values (0, 2, 'number', '<250 medewerkers', '');
insert into tmp_question_option values (0, 2, 'number', '>250 medewerkers', '10a');
insert into tmp_question_option values (0, 2, 'number', '>250 medewerkers', '2c');
insert into tmp_question_option values (0, 3, 'number', '<5000 personen', '10a');
insert into tmp_question_option values (0, 3, 'number', '<5000 personen', '2c');
insert into tmp_question_option values (0, 3, 'number', '>5000 personen', '10a');
insert into tmp_question_option values (0, 3, 'number', '>5000 personen', '2c');
insert into tmp_question_option values (0, 3, 'number', '>5000 personen', '11a');
insert into tmp_question_option values (0, 3, 'number', '>5000 personen', '9c');
insert into tmp_question_option values (0, 4, 'multiple', 'naam, adres, geboortedatum,titulatuur, geslacht', '');
insert into tmp_question_option values (0, 4, 'multiple', 'e-mailadres, telefoonnummer, zakelijk adres, huisadres,locatie', '');
insert into tmp_question_option values (0, 4, 'multiple', 'werkgever, functie, leidinggevende, personeelsnummmer', '');
insert into tmp_question_option values (0, 4, 'multiple', 'loopbaan, opleidingen, competenties', '10a');
insert into tmp_question_option values (0, 4, 'multiple', 'medisch dossiers', '10a');
insert into tmp_question_option values (0, 4, 'multiple', 'antwoorden, klachten, meningen, publicaties', '10a');
insert into tmp_question_option values (0, 4, 'multiple', 'inhoud van e-mails, surfgedrag', '10a');
insert into tmp_question_option values (0, 4, 'multiple', 'overtredingen, veroordelingen', '10a');
insert into tmp_question_option values (0, 4, 'multiple', 'loginnamen, wachtwoorden', '10a');
insert into tmp_question_option values (0, 4, 'multiple', 'identificatienummers', '10a');
insert into tmp_question_option values (0, 4, 'multiple', 'IP-adressen,tracking cookies, RFID-nummers, MAC-adressen.', '');
insert into tmp_question_option values (0, 5, 'multiple', 'Ras of etniciteit', '10a');
insert into tmp_question_option values (0, 5, 'multiple', 'Politieke opvattingen', '10a');
insert into tmp_question_option values (0, 5, 'multiple', 'Religieuze of levensbeschouwelijke overtuigingen', '10a');
insert into tmp_question_option values (0, 5, 'multiple', 'Het lidmaatschap van een vakbond', '10a');
insert into tmp_question_option values (0, 5, 'multiple', 'Genetische gegevens', '10a');
insert into tmp_question_option values (0, 5, 'multiple', 'Biometrische gegevens (gebruikt om mensen uniek te identificeren)', '10a');
insert into tmp_question_option values (0, 5, 'multiple', 'Gegevens over gezondheid', '10a');
insert into tmp_question_option values (0, 5, 'multiple', 'Gegevens over iemands seksueel gedrag of seksuele gerichtheid', '10a');
insert into tmp_question_option values (0, 6, 'multiple', 'Wettelijke verplichting', '6a');
insert into tmp_question_option values (0, 6, 'multiple', 'In het kader van de uitvoering van een contract', '6a');
insert into tmp_question_option values (0, 6, 'multiple', 'Er is sprake van een vitaal belang voor de betrokkenen', '6a');
insert into tmp_question_option values (0, 6, 'multiple', 'U organisatie heeft het nodig om een overheidstaak te vervullen', '6a');
insert into tmp_question_option values (0, 6, 'multiple', 'Het belang van uw organisatie weegt zwaarder dan dat van de betrokkenen', '6a');
insert into tmp_question_option values (0, 6, 'multiple', 'U heeft expliciete toestemming ontvangen van de betrokkenen', '6a');
insert into tmp_question_option values (0, 7, 'choice', 'Ja', '3a');
insert into tmp_question_option values (0, 7, 'choice', 'Nee', '3b');
insert into tmp_question_option values (0, 7, 'choice', 'Weet ik niet', '3a');
insert into tmp_question_option values (0, 8, 'choice', 'Ja', '1a');
insert into tmp_question_option values (0, 8, 'choice', 'Nee', '1a');
insert into tmp_question_option values (0, 8, 'choice', 'Weet ik niet', '1a');
insert into tmp_question_option values (0, 9, 'choice', 'Ja', '2b');
insert into tmp_question_option values (0, 9, 'choice', 'Nee', '2a');
insert into tmp_question_option values (0, 10, 'choice', 'Ja', '2d');
insert into tmp_question_option values (0, 10, 'choice', 'Nee', '2c');
insert into tmp_question_option values (0, 11, 'multiple', 'Inzage Persoonsgegevens (PG)', '4a');
insert into tmp_question_option values (0, 11, 'multiple', 'Corrigeren PG', '4a');
insert into tmp_question_option values (0, 11, 'multiple', 'Overdragen PG', '4a');
insert into tmp_question_option values (0, 11, 'multiple', 'Verwijderen PG', '4a');
insert into tmp_question_option values (0, 11, 'multiple', 'Bezwaar maken', '4a');
insert into tmp_question_option values (0, 12, 'choice', 'Ja', '5b');
insert into tmp_question_option values (0, 12, 'choice', 'Nee', '5a');
insert into tmp_question_option values (0, 13, 'choice', 'Ja', '7a');
insert into tmp_question_option values (0, 13, 'choice', 'Nee', '7a');
insert into tmp_question_option values (0, 14, 'choice', 'Ja', '8a');
insert into tmp_question_option values (0, 14, 'choice', 'Nee', '8a');
insert into tmp_question_option values (0, 15, 'choice', 'Firewall ', '');
insert into tmp_question_option values (0, 15, 'choice', 'Antivirus ', '');
insert into tmp_question_option values (0, 15, 'choice', 'Encryptie', '');
insert into tmp_question_option values (0, 15, 'choice', 'Pseudonimiseren', '');
insert into tmp_question_option values (0, 15, 'choice', 'Anonimiseren', '');
insert into tmp_question_option values (0, 16, 'choice', 'Ja', '');
insert into tmp_question_option values (0, 16, 'choice', 'Nee', '');
insert into tmp_question_option values (0, 17, 'choice', 'Ja', '9b');
insert into tmp_question_option values (0, 17, 'choice', 'Nee', '9a');
insert into tmp_question_option values (0, 18, 'choice', 'Ja', '11b');
insert into tmp_question_option values (0, 18, 'choice', 'Nee', '11b');
insert into tmp_question_option values (0, 19, 'choice', 'Ja', '13a');
insert into tmp_question_option values (0, 19, 'choice', 'Nee', '13a');
insert into tmp_question_option values (0, 20, 'choice', 'Ja', '12b');
insert into tmp_question_option values (0, 20, 'choice', 'Nee', '12a');

alter table tmp_question_option
	add tmp_string varchar(1000) not null default '';

update tmp_question_option
	set tmp_string = concat(tmp_option, ',')
where tmp_option > '' and tmp_type in ('choice', 'multiple');

DROP PROCEDURE IF EXISTS stp_createQuestionOption;

DELIMITER //
	CREATE PROCEDURE stp_createQuestionOption()
	BEGIN

		DECLARE counter INT DEFAULT 1;

		DROP TABLE IF EXISTS tmp_question_option_unique;
		CREATE TABLE tmp_question_option_unique
		(
			tmp_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            tmp_opt_id INT UNSIGNED NOT NULL,
            tmp_question INT UNSIGNED NOT NULL,
			tmp_option VARCHAR(100) NOT NULL,
			PRIMARY KEY (tmp_id)
		);

		WHILE counter > 0 DO

			INSERT INTO tmp_question_option_unique
			SELECT DISTINCT 0, min(tmp_id), tmp_question,
                trim(substring(tmp_string, 1, locate(',', tmp_string) - 1))
			FROM tmp_question_option AS tmp
			WHERE tmp_string > '' AND tmp_type IN ('choice', 'multiple')
			GROUP BY 3, 4;

			UPDATE tmp_question_option AS tmp
			SET tmp_string = trim(substring(tmp_string, locate(',', tmp_string) + 1, 1000))
			WHERE locate(',', tmp_string) > 0;

			SET counter = ROW_COUNT();

		END WHILE;

	END //
DELIMITER ;

CALL stp_createQuestionOption();

alter table tmp_question_option_unique
add tmp_code varchar(45) not null default '';

update tmp_question_option_unique
set tmp_code = UPPER(LEFT(UUID(), 8));

CALL stp_upsertDimension('sys.type', 'option', @option_id);
INSERT INTO main_dimension_record VALUES (0, @option_id, func_getDimensionID('sys.attr.desc'), 0);
-- CALL stp_upsertRecordValue(@option_id, 'sys.attr.desc', 'sys.lang.nl', 'Opties', 0, @attr_id);
CALL stp_upsertRelation('sys.type.question', 'sys.type.option', @ques_option_id);

-- select * from tmp_question_option_unique;

drop temporary table if exists tmp_records;
create temporary table tmp_records
(
	tmp_id int unsigned not null auto_increment,
    tmp_dbid int unsigned not null default 0,
	tmp_code varchar(45) not null,
	tmp_desc varchar(1000) not null,
	primary key (tmp_id)
);

insert into tmp_records select 0, 0, tmp_code, tmp_option from tmp_question_option_unique;
start transaction;
call stp_upsertDimensionRecords('sys.type.option');
commit;

drop table if exists tmp_options;
create table tmp_options as select * from tmp_records;

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
	FROM tmp_options AS tmp
	JOIN main_dimension_record AS madr
	  ON madr.madr_id = tmp.tmp_dbid
) AS tmp
WHERE NOT EXISTS
	(SELECT 1 FROM main_record_value
		WHERE mava_fk_record = tmp.mava_fk_record
          AND mava_fk_dimension = tmp.mava_fk_dimension
          AND mava_fk_language = tmp.mava_fk_language
          AND mava_value = tmp.tmp_desc);

insert into main_record_value
select *
from
(
	select distinct
		0 as mava_id,
		mava_fk_record,
		func_getDimensionID('sys.attr.type') as mava_fk_dimension,
		1 as mava_fk_language,
		null as mava_fk_value,
		tmp_type as mava_value
	from tmp_question_option as opt
	join tmp_questions as ques
	  on ques.tmp_id = opt.tmp_question
	join main_record_value
	  on mava_value = upper(ques.tmp_code)
) as tmp
where not exists
	(select 1 from main_record_value
		where mava_fk_record = tmp.mava_fk_record
          and mava_fk_dimension = tmp.mava_fk_dimension
          and mava_fk_language = tmp.mava_fk_language
          and mava_value = tmp.mava_value);

insert into main_record_value
select *
from
(
	select distinct
		0 as mava_id,
		mava_fk_record,
		func_getDimensionID('sys.attr.tag') as mava_fk_dimension,
		1 as mava_fk_language,
		null as mava_fk_value,
		CASE
			WHEN tmp_type = 'choice' THEN 'radio'
			WHEN tmp_type = 'multiple' THEN 'multiple'
			ELSE 'input'
		END AS mava_value
	from tmp_question_option as opt
	join tmp_questions as ques
	  on ques.tmp_id = opt.tmp_question
	join main_record_value
	  on mava_value = upper(ques.tmp_code)
) as tmp
where not exists
	(select 1 from main_record_value
		where mava_fk_record = tmp.mava_fk_record
          and mava_fk_dimension = tmp.mava_fk_dimension
          and mava_fk_language = tmp.mava_fk_language
          and mava_value = tmp.mava_value);

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
		q.tmp_dbid as marr_fk_parent,
		o.tmp_dbid as marr_fk_child
	from tmp_options as o
	join tmp_question_option_unique as ou
	  on ou.tmp_code = o.tmp_code
	join tmp_questions as q
      on q.tmp_id = ou.tmp_question
) as tmp
join
(
	select func_getRelationID('sys.type.question', 'sys.type.option') as marr_fk_relation
) as rel
where not exists
	(select 1 from main_relation_record
		where marr_fk_relation = rel.marr_fk_relation
          and marr_fk_parent = tmp.marr_fk_parent
          and marr_fk_child = tmp.marr_fk_child)
order by marr_fk_parent, marr_fk_child;

start transaction;
CALL stp_upsertRelationRecords(0);
commit;

/*

select * from tmp_question_option;
select * from tmp_question_option_unique;
select * from tmp_options;
select * from tmp_questions;


insert into main_record_value
select *
from
(
	select
		0 as mava_id,
		qmadr.madr_fk_record as mava_fk_record,
		madr.madr_fk_record as mava_fk_dimension,
		-- func_getDimensionID('sys.lang.nl') AS mava_fk_language,
        1 AS mava_fk_language, -- 1 = system
		null as mava_fk_value,
		qoptu.tmp_code as mava_value
	-- select *
	from tmp_question_option_unique as qoptu
	join main_dimension_record as madr
	  on madr_fk_dimension = func_getDimensionID('sys.type.question')
	 and madr_fk_record = func_getDimensionID('sys.attr.options')
	join tmp_questions as ques
	  on ques.tmp_id = qoptu.tmp_question
	join main_dimension_record as qmadr
      on qmadr.madr_id = ques.tmp_dbid
	order by qmadr.madr_fk_record, qoptu.tmp_id
) as tmp
where not exists
	(select 1 from main_record_value
		where mava_fk_record = tmp.mava_fk_record
          and mava_fk_dimension = tmp.mava_fk_dimension
          and mava_fk_language = tmp.mava_fk_language
          and mava_value = tmp.mava_value);
          
insert into main_record_value
select *
from
(
	select
		0 as mava_id,
		qmadr.madr_fk_record as mava_fk_record,
		madr.madr_fk_record as mava_fk_dimension,
		func_getDimensionID('sys.lang.nl') AS mava_fk_language,
		mava.mava_id as mava_fk_value,
		qoptu.tmp_option as mava_value
	-- select *
	from tmp_question_option_unique as qoptu
	join main_dimension_record as madr
	  on madr_fk_dimension = func_getDimensionID('sys.type.question')
	 and madr_fk_record = func_getDimensionID('sys.attr.options')
	join tmp_questions as ques
	  on ques.tmp_id = qoptu.tmp_question
	join main_dimension_record as qmadr
      on qmadr.madr_id = ques.tmp_dbid
	join main_record_value as mava
      on mava.mava_fk_record = qmadr.madr_fk_record
	 and mava.mava_fk_dimension = madr.madr_fk_record
     and mava.mava_fk_language = 1
     and mava.mava_value = qoptu.tmp_code
) as tmp
where not exists
	(select 1 from main_record_value
		where mava_fk_record = tmp.mava_fk_record
          and mava_fk_dimension = tmp.mava_fk_dimension
          and mava_fk_language = tmp.mava_fk_language
          and mava_value = tmp.mava_value);


*/
