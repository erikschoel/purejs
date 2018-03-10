select * from ques_basket;

show create table ques_basket;

delete from ques_basket where bask_id = 0;

select group_concat(concat('\'', COLUMN_NAME, '\'')) from information_schema.COLUMNS where TABLE_NAME = 'ques_selector';

select * from ques_item;

	SELECT *
			FROM ques_item AS item
            JOIN main_record AS itlk
              ON itlk.mare_id = item_id
			JOIN main_record AS qilk
			  ON qilk.mare_fk_child = item_id
			 AND qilk.mare_maintype = 'main_relation'
			JOIN ques_selector AS sele
			  ON sele_fk_question = qilk.mare_fk_parent
			JOIN ques_question_answer AS quan
			  ON quan.quan_fk_entity = 0
			 AND quan.quan_fk_question = sele.sele_fk_question
			JOIN ques_selector_record_link
			  ON seta_fk_selector = sele_id
			 AND seta_fk_record = qilk.mare_fk_child
			WHERE func_runSelector(
				func_getOptionValue(quan_fk_question_option, quan_answer),
				sele.sele_operator,
				func_getOptionValue(sele_fk_question_option, sele_value),
				sele.sele_type
			) = 1

select * from ques_selector;

update ques_selector
set sele_fk_question




select * from main_record where mare_fk_parent is not null;

select * from ques_selector;

select * from org_model;
select * from org_unit;
show create table org_program;
select * from org_program
join main_record on mare_id = prgm_id
select * from ques_program;

INSERT INTO org_company VALUES (0, 'SYS', 'Systeem');

CALL stp_upsertMainRecord('org_program', 'BASIS', 'Basis Implementatie', @mare_id);
insert into org_program values (@mare_id, 'PROJECT', 'BASIS', 'Basis Implementatie');
update main_record
set mare_fk_parent = (select prog_id from ques_program where prog_code = 'INTK')
where mare_id = @mare_id;
select @mare_id;

select * from org_company;
show create table org_program_instance;

CALL stp_upsertMainRecord('org_program_instance', 'BASIS', 'Basis Implementatie', @mare_id);
insert into org_program_instance
select
	@mare_id,
    (select prgm_id from org_program where prgm_code = 'BASIS'),
    0, 'BASIS', 'Basis Implementatie';

alter table org_program_task_instance
add ptin_fk_role int(10) null after ptin_fk_parent;

alter table org_program_task_instance
add ptin_fk_stakeholder int(10) null after ptin_fk_role;

alter table org_program_task_instance
add ptin_perc_complete smallint unsigned default 0 not null after ptin_deadline;



show create table org_program_task_instance

select * from tmp_tasks;

insert into main_record
select
	0,
    'org_program_task_instance',
    tmp_sort_order,
    '',
    null, null,
    CURRENT_TIMESTAMP(), 'system', null, null, 0
from tmp_tasks;

insert into org_program_task_instance
select
	mare_id,
    prin_id,
    tmp_task_id,
    null,
	null,
    (select orgr_id from org_role where orgr_code = 'MAN') as ptin_fk_stakeholder,
    '2017-11-01',
    '2017-11-30',
    0, mare_code, mare_description
from tmp_tasks as tmp
join main_record as mare
  on mare_maintype = 'org_program_task_instance'
 and mare_code = tmp_sort_order
join org_program_instance as prin
  on prin.prin_code = 'BASIS'
where tmp_id = 1;

select * from org_role;
select * from org_program_task_instance;
select * from tmp_tasks;

insert into org_program_task_instance
select
	mare_id,
    prin_id,
    tmp_task_id,
    232,
	null,
    (select orgr_id from org_role where orgr_code = 'MAN') as ptin_fk_stakeholder,
    '2017-11-01',
    '2017-11-30',
    0, mare_code, mare_description
from tmp_tasks as tmp
join main_record as mare
  on mare_maintype = 'org_program_task_instance'
 and mare_code = tmp_sort_order
join org_program_instance as prin
  on prin.prin_code = 'BASIS'
where tmp_id > 1;
    
select * from org_program_instance;
select * from main_record;
select * from org_role;

delete from main_record where mare_maintype = 'org_program_task_instance';

update main_record
set mare_fk_parent = (select prog_id from ques_program where prog_code = 'INTK')
where mare_id = @mare_id;
select @mare_id;


CALL stp_upsertMainRecord('org_program_task', 'DM-01', 'Data Mapping maken', @mare_id);
insert into org_program_task 
select
	mare_id,
    prgm_id,
    null,
    orun_id,
    mare_code,
    mare_description
from main_record
	join org_program on prgm_code = 'BASIS'
    join org_unit on orun_code = 'GDPR-TEAM'
where mare_id = @mare_id;

update main_record set mare_fk_parent = 58 where mare_id = @mare_id;

alter table org_fk_program_task_instance
rename org_program_task_instance;

CALL stp_upsertMainRecord('org_program_task', 'VW-01', 'Verwerkingsregister aanmaken', @mare_id);
insert into org_program_task 
select
	mare_id,
    prgm_id,
    null,
    orun_id,
    mare_code,
    mare_description
from main_record
	join org_program on prgm_code = 'BASIS'
    join org_unit on orun_code = 'GDPR-TEAM'
where mare_id = @mare_id;

-- Systematische beschrijving van de gegevensverwerking
-- Evaluatie noodzaak en mate van verwerking
-- Verwerkings-activiteiten in overeenkomsten evalueren
-- Risico-management en risico-beheersing

CALL stp_upsertMainRecord('org_program_task', 'VW-01-04', 'Risico-management en risico-beheersing', @mare_id);
insert into org_program_task 
select
	mare_id,
    prgm_id,
    null,
    orun_id,
    mare_code,
    mare_description
from main_record
	join org_program on prgm_code = 'BASIS'
    join org_unit on orun_code = 'GDPR-TEAM'
where mare_id = @mare_id;

update main_record
set mare_fk_parent = (select prta_id from org_program_task where prta_code = 'VW-01')
where mare_id = @mare_id;

select * from ques_program;

select * from org_program_task;



select * from org_program_task
join main_record on mare_id = prta_id;

alter table org_program_task
modify prta_description varchar(255) not null;
    
    
update main_record
set mare_fk_parent = (select prog_id from ques_program where prog_code = 'INTK')
where mare_id = @mare_id;



select * from ques_question;

drop temporary table if exists tmp_questions;
create temporary table tmp_questions
(
	tmp_id int unsigned auto_increment,
    tmp_num int unsigned default 0 not null,
    tmp_desc varchar(255) not null,
    tmp_type varchar(30) not null,
    tmp_cat varchar(255) not null,
    primary key (tmp_id)
);

insert into tmp_questions values (0, 3, 'Wat zijn de doelstellingen van de gegevensverwerking?', 'text', 'Systematische beschrijving van de gegevensverwerking');
insert into tmp_questions values (0, 5, 'Voor welke duur worden de persoonsgegevens bewaard? (maanden)', 'string', 'Systematische beschrijving van de gegevensverwerking');
insert into tmp_questions values (0, 7, 'Wat zijn de contactgegevens van verwerkende partijen?', 'text', 'Systematische beschrijving van de gegevensverwerking');
insert into tmp_questions values (0, 11, 'Heeft u de doelstellingen van elke gegevensverwerking gespecificeerd en is deze expliciet?', 'text', 'Evaluatie noodzaak en mate van verwerking');
insert into tmp_questions values (0, 12, 'Heeft u een legitieme doelstellingen voor iedere gegevensverwerking?', 'choice', 'Evaluatie noodzaak en mate van verwerking');
insert into tmp_questions values (0, 13, 'Is iedere gegevensverwerking wettelijk toegestaan?', 'choice', 'Evaluatie noodzaak en mate van verwerking');
insert into tmp_questions values (0, 14, 'Is iedere gegevensverwerking adequaat, relevant en beperkt tot de noodzakelijke gegevens?', 'choice', 'Evaluatie noodzaak en mate van verwerking');
insert into tmp_questions values (0, 15, 'Is er een beperkte opslagduur voor iedere gegevenscategorie?', 'choice', 'Evaluatie noodzaak en mate van verwerking');
insert into tmp_questions values (0, 22, 'Zijn de genomen beveiligingsmaatregelen opgenomen in de verwerkingsovereenkomsten', 'choice', 'Verwerkings-activiteiten in overeenkomsten evalueren');
insert into tmp_questions values (0, 31, 'Welke technische en organisatorische veiligheidsmaatregelen zijn er getroffen om het risico op ongeoorloofde toegang tot persoonsgegevens te beheersen?', 'text', 'Risico-management en risico-beheersing');
insert into tmp_questions values (0, 32, 'Welke technische en organisatorische veiligheidsmaatregelen zijn er getroffen om het risico op onwenselijke aanpassing van persoonsgegevens te beheersen?', 'text', 'Risico-management en risico-beheersing');
insert into tmp_questions values (0, 33, 'Welke technische en organisatorische veiligheidsmaatregelen zijn er getroffen om het risico op het verdwijnen van persoonsgegevens te beheersen?', 'text', 'Risico-management en risico-beheersing');

select * from tmp_questions;

insert into main_record
select
	0,
    'ques_question',
    '',
    tmp_desc,
    null, null,
    CURRENT_TIMESTAMP(), 'system', null, null, tmp_id
from tmp_questions as tmp
where not exists
	(select 1 from main_record
		where mare_maintype = 'ques_question'
			and mare_description = tmp.tmp_desc);

insert into ques_question_category
select distinct 0, tmp_cat
from tmp_questions as tmp
where not exists
	(select 1 from ques_question_category
		where quca_description = tmp.tmp_cat);

select * from ques_question;

insert into ques_question
select
	mare_id,
    quca_id,
    tmp_type,
    mare_code,
    mare_description,
    null
from tmp_questions as tmp
join main_record as mare
  on mare_maintype = 'ques_question'
 and mare_description = tmp_desc
join ques_question_category as cat
  on quca_description = tmp_cat
where not exists
	(select 1 from ques_question
		where ques_description = tmp.tmp_desc);

select * from main_record;

set @mare_id = 182;

insert into main_record
select
	0,
    'main_relation',
    concat(cast(prta_id as char),'-',cast(mare_id as char)),
    '',
    prta_id, mare_id,
    CURRENT_TIMESTAMP(), 'system', null, null, tmp_id
from tmp_questions as tmp
join main_record as mare
  on mare_maintype = 'ques_question'
 and mare_description = tmp_desc
join org_program_task as prta
  on prta_description = tmp_cat
where not exists
	(select 1 from main_record
		where mare_maintype = 'main_relation'
			and mare_fk_parent = prta.prta_id
				and mare_fk_child = mare.mare_id);

delete from main_record where mare_fk_parent = 182 and mare_maintype = 'main_relation';

select * from org_program_task;

CALL stp_getQuestions(0, 34);
CALL stp_getQuestions(0, 182);
select * from ques_program;

select * from main_record where mare_fk_parent = 60 and mare_maintype = 'org_program_task';

alter table ques_question_answer
add `quan_fk_record` int(10) unsigned null after quan_fk_question_option;

select * from main_user;



select @mare_id

select * from main_record where mare_id = 35;


update main_record
set mare_fk_parent = 182, mare_code = concat('182-', cast(mare_fk_child AS CHAR))
where mare_fk_parent between 198 and 201 and mare_maintype = 'main_relation'



select * from ques_item;
select * from ques_program;

select * from org_program;
select * from org_program_task;

select *
from ques_selector_record_link
join main_record
  on mare_id = seta_fk_record
 and mare_maintype = 'ques_item'
join ques_selector
  on sele_id = seta_fk_selector
