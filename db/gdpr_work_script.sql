use purejs_test;
use purejs_gdprdemo;
SET @entity_id = func_getRecordID('sys.type.entity', 'sys.attr.code', 'SYS');

CALL stp_upsertDimensionRecord('sys.type.entity', 'SYS', @entity_id);
SELECT @entity_id;
show create table purejs_db.main_dimension_record;

ALTER DATABASE purejs_test CHARACTER SET utf8 COLLATE utf8_unicode_ci;

ALTER TABLE main_dimension
 CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci;

ALTER TABLE main_dimension_record
 CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci;

ALTER TABLE main_record
 CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci;

ALTER TABLE main_record_value
 CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci;

ALTER TABLE main_relation
 CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci;

ALTER TABLE main_relation_record
 CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci;

ALTER TABLE main_selector
 CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci;

ALTER TABLE main_selector_record
 CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci;

ALTER TABLE main_user
 CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci;

ALTER TABLE tmp_options
 CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci;

ALTER TABLE tmp_question_option_unique
 CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci;

ALTER TABLE tmp_question_option
 CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci;

ALTER TABLE tmp_baskets
 CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci;

ALTER TABLE tmp_items
 CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci;

ALTER TABLE tmp_questions
 CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci;


select TABLE_SCHEMA, TABLE_NAME, CREATE_TIME, TABLE_COLLATION from information_schema.TABLES;

select * from main_record_value;

select func_getRecordID('sys.app.item', 'sys.attr.code', 'MAIN');
show variables;
select func_getRecordID('sys.attr.program', :attr_code, :prog_code) as mare_id

CALL stp_selectRecords('sys.type.entity.%', 'sys.lang.nl');
SELECT
	tmp.*,
    case when tmp.main_rec_id is null then '{}' else func_getRecordData(tmp.main_rec_id, func_getDimensionID('sys.lang.nl'), FALSE) end as json
FROM tmp_records AS tmp
ORDER BY dim_code, rela_child_code;

	select *
	from main_relation_record
	left join main_dimension_record
	  on madr_fk_record = marr_id
	where marr_fk_relation = func_getDimensionID('sys.app.menu.item');

	select *
	from main_relation_record
	where marr_fk_relation = func_getDimensionID('sys.app.menu.item.item');



CALL stp_selectRecursive(func_getRecordID('sys.app.menu', 'sys.attr.code', 'main'), 'sys.lang.nl', FALSE);
CALL stp_selectRecursive(64, 'sys.lang.nl', TRUE);
SELECT * FROM main_dimension ORDER BY madi_code;
SELECT * FROM tmp_recursive ORDER BY tmp_sort_order;
SELECT * FROM tmp_add_records;


SELECT * FROM main_dimension_record
WHERE madr_fk_dimension = func_getDimensionID('sys.app.menu.item');
CALL stp_selectRecursive(64, 'sys.lang.nl', TRUE);
SELECT * FROM main_dimension ORDER BY madi_code;
SELECT * FROM main_record_value WHERE mava_fk_record IN (11, 13, 133, 137);
SELECT * FROM main_record_value WHERE mava_value IN ('43041814', 'FF821A04');
-- 181 en 187
SELECT * FROM main_record_value WHERE mava_fk_record in (181, 187);
-- 98 en 99
SELECT * FROM main_dimension_record WHERE madr_id IN (98, 99);
select * from main_dimension;
select * from main_record_value where mava_value in ('Admin', 'Settings' );
select * from main_dimension_record where madr_fk_record in (170, 175);
select * from main_record_value order by mava_id desc;

SELECT
	tmp.*,
    func_getRecordData(madr.madr_fk_record, func_getDimensionID('sys.lang.nl'), FALSE) as json
FROM tmp_recursive AS tmp
JOIN main_dimension_record AS madr
  ON madr_id = tmp_rec_id
ORDER BY tmp_sort_order;





select *
from main_dimension_record
join main_record_value
  on mava_fk_record = madr_fk_record
join main_dimension
  on madi_id = madr_fk_dimension
where mava_value = 'admin'
and mava_fk_dimension = func_getDimensionID('sys.attr.code');

select * from main_record_value where mava_value = 'admin';

select
-- 	madi_id as dim_id,
--     madi_code as dim_code,
    *,
    func_getRecordData(madr_fk_record, '' , FALSE) as json
from main_dimension
join main_dimension_record
  on madr_fk_dimension = madi_id
where madi_code like 'sys.app%';

select * from main_dimension order by madi_code;
select * from main_relation;



CALL stp_selectRecords('%', 'sys.lang.nl');

SELECT * FROM main_record_value ORDER BY mava_id desc;
SELECT * FROM main_dimension ORDER BY madi_id desc;
SELECT * FROM main_record ORDER BY mare_id desc;
SELECT * FROM main_relation ORDER BY marl_id desc;











select
	func_getRecordAttr(72, 'sys.attr.desc', 'sys.lang.nl'),
    func_getRecordAttr(138, 'sys.attr.desc', 'sys.lang.nl');

select * from main_record_value where mava_value like 'Infor%' order by mava_id desc;

select * from main_record_value where mava_fk_record in (33, 49);

select * from main_user
join main_record
  on mare_id = maus_id
join main_dimension_record
  on madr_id = mare_id;

select * from main_record;

select * from main_dimension_record where madr_id = 10;
select * from main_dimension where madi_id = 12;
select func_getDimensionID('sys.type.user');
select func_getDimensionID('sys.type.question');
-- SELECT func_getDimensionID('sys.type.entity.project');



