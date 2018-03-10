select * from tmp_question_option;
select * from tmp_question_option_unique order by tmp_question, tmp_id;

SELECT * FROM `main_record`;
SELECT * FROM `main_record_value`;
SELECT * FROM `main_dimension` ORDER BY madi_code;
SELECT * FROM `main_dimension_record`;
SELECT * FROM `main_relation`;
SELECT * FROM `main_relation_record`;

use purejs_db;
select *
from main_dimension_record
join main_dimension
  on madi_id = madr_fk_dimension
where madr_fk_record = 26;

SELECT func_getMadrID('mare_63');

CALL stp_selectRecursive(47, 'sys.lang.nl', FALSE);

select * from main_dimension order by madi_code;

select * from main_record_value
where mava_fk_dimension = 3
and mava_fk_language = 1
and (mava_value like 'SYS%' or mava_value like 'QUES%' or mava_value like '%/%')

update main_record_value
set mava_value = lower(mava_value)
where mava_fk_dimension = 3
and mava_fk_language = 1
and (mava_value like 'SYS%' or mava_value like 'QUES%' or mava_value like '%/%')


select func_getRecordID('sys.type.entity', 'sys.attr.code', 'sys');

CALL stp_selectRecursive(64, 'sys.lang.nl', TRUE);
select * from main_dimension where madi_code like '%entity%';
select * from main_dimension_record where madr_id = 64;
select * from main_selector;
show processlist;

select func_getParentPath('sys.type.entity', 'sys.type.item', TRUE);

kill 717608;

				SELECT DISTINCT
					tmp_id,
                    sele_fk_dimension AS tmp_dim_id,
                    null as tmp_madr_id,
                    tmp_madr_id as tmp_parent_id,
					sere_fk_record AS tmp_rec_id,
                    marr_order as tmp_order,
                    0 as tmp_marr_id,
					tmp_sort_order
				FROM tmp_recursive
				JOIN main_relation_record as marr
				  ON marr.marr_fk_parent = tmp_madr_id
                JOIN main_selector as sele
				  ON sele.sele_fk_record = marr.marr_fk_child
				JOIN main_selector_record AS sere
				  ON sere.sere_fk_selector = sele.sele_id
				JOIN main_record_value AS mava
				  ON mava.mava_fk_record = marr.marr_id
				 AND mava.mava_fk_dimension = sele.sele_fk_dimension
				 AND func_runSelector(
					 func_getOptionValue(mava.mava_fk_value, mava.mava_value),
					 sele.sele_operator,
					 func_getOptionValue(sele.sele_fk_value, sele.sele_value),
					 sele.sele_type
					) = 1
				WHERE tmp_level = 0;

select *,
func_getRecordData(madr_fk_record, func_getDimensionID('sys.lang.nl'), FALSE)
from main_relation_record
join main_dimension_record
  on madr_id = marr_fk_child
where marr_id in (127,130);



select
	madr_id,
	madr_fk_record as ques_id,
    max(case when mava_fk_dimension = 4 then mava_value else '' end) as ques_description,
    substring(group_concat(case when mava_fk_dimension = 5 then mava_value else '' end separator '|'), 2) as ques_options
select *
from main_dimension_record
join main_record_value
  on mava_fk_record = madr_fk_record
 and mava_fk_language = func_getDimensionID('sys.lang.nl')
where madr_fk_dimension = func_getDimensionID('sys.type.question')
order by mava_fk_record, coalesce(mava_fk_value, 0)
group by madr_id, madr_fk_record;


select * from main_record order by mare_id desc;
delete from main_record_value where mava_fk_record > 98;
delete from main_record where mare_id > 98;

select * from purejs_gdpr.main_user;


select *
from main_relation as marl
join main_dimension as madi
  on madi.madi_id = marl.marl_id
join main_dimension as dimp
  on dimp.madi_id = marl.marl_fk_parent_dimension
join main_dimension as dimc
  on dimc.madi_id = marl.marl_fk_child_dimension;

CALL stp_upsertDimensionRecord('sys.type.entity', 'SYS', @entity_id);
select *
from main_dimension_record
join main_record_value on mava_fk_record = madr_fk_record
join main_dimension on madi_id = madr_fk_dimension
where madr_id = @entity_id;

CALL stp_upsertDimensionRecord('sys.type.program', 'INTK', @prog_id);
CALL stp_upsertDimensionRecordValue(@prog_id, 'sys.attr.desc', 'sys.lang.nl', 'Intake', @prog_desc_id);

CALL stp_selectDimensionRecord(@prog_id, 'sys.lang.nl');
select * from tmp_record;

select * from purejs_gdpr.ques_program;
CALL purejs_gdpr.stp_getQuestions(0, 34);

select @prog_id;

select *
from main_dimension_record
join main_record_value on mava_fk_record = madr_fk_record
join main_dimension on madi_id = madr_fk_dimension
where madr_id = @prog_id;

CALL stp_upsertRelationRecord(func_getDimensionID('sys.type.entity.question'), @entity_id, 5, 0, @enti_ques_idd);

select @enti_ques_id, @enti_ques_idd;

select func_getDimensionID('sys.type.entity.question');

select *
from main_relation_record
join main_dimension on madi_id = marr_fk_relation
join main_record_value on mava_fk_record = marr_id
where marr_id = @enti_ques_id;

select *
from main_dimension_record
join main_record_value
  on mava_fk_record = madr_fk_record
 and mava_fk_language = func_getDimensionID('sys.lang.nl')
 and mava_fk_dimension = func_getDimensionID('sys.attr.desc')
where madr_fk_dimension = func_getDimensionID('sys.type.question');

select *
from main_dimension_record
join main_record_value
  on mava_fk_record = madr_fk_record
 and mava_fk_language = func_getDimensionID('sys.lang.nl')
where madr_fk_dimension = func_getDimensionID('sys.type.basket');

select *
from main_dimension_record
join main_record_value
  on mava_fk_record = madr_fk_record
 and mava_fk_dimension = func_getDimensionID('sys.attr.desc')
 and mava_fk_language = func_getDimensionID('sys.lang.nl')
where madr_fk_dimension = func_getDimensionID('sys.type.question');

select *
from main_dimension_record
join main_record_value
  on mava_fk_record = madr_fk_record
where madr_fk_dimension = func_getDimensionID('sys.type.question');

select * from main_relation_record;

SELECT *
FROM purejs_gdpr.ques_selector_record_link
JOIN purejs_gdpr.ques_selector
  ON sele_id = seta_fk_selector
JOIN purejs_gdpr.ques_question
  ON ques_id = sele_fk_question
JOIN purejs_gdpr.main_record
  ON mare_id = seta_fk_record
ORDER BY seta_fk_selector, seta_fk_record desc;

select * from tmp_relations;

SELECT
	rela_id,
    rela_parent_id,
    rela_parent_record,
    max(case when mavap.mava_fk_dimension = 2 then mavap.mava_value else '' end) as rela_parent_code,
    max(case when mavap.mava_fk_dimension = 4 then mavap.mava_value else '' end) as rela_parent_desc,
    rela_child_id,
    rela_child_record,
	max(case when mavac.mava_fk_dimension = 2 then mavac.mava_value else '' end) as rela_child_code,
    max(case when mavac.mava_fk_dimension = 4 then mavac.mava_value else '' end) as rela_child_desc
FROM
(
	SELECT
		marr.marr_id as rela_id,
        madrp.madr_id as rela_parent_id,
        madrp.madr_fk_record as rela_parent_record,
        madrc.madr_id as rela_child_id,
        madrc.madr_fk_record as rela_child_record
	FROM main_relation_record AS marr
	JOIN main_dimension_record AS madrp
      ON madrp.madr_id = marr.marr_fk_parent
	JOIN main_dimension_record AS madrc
      ON madrc.madr_id = marr.marr_fk_child
	WHERE marr_fk_relation = func_getRelationID('sys.type.basket', 'sys.type.item')
) AS tmp
JOIN main_record_value AS mavap
  ON mavap.mava_fk_record = rela_parent_record
 -- AND mavap.mava_fk_dimension = 4
 AND mavap.mava_fk_language = CASE WHEN mavap.mava_fk_dimension = 2 THEN 1 ELSE 18 END
JOIN main_record_value AS mavac
  ON mavac.mava_fk_record = rela_child_record
 AND mavac.mava_fk_dimension = mavap.mava_fk_dimension
 AND mavac.mava_fk_language = mavap.mava_fk_language
GROUP BY rela_id;

CALL stp_selectRelationRecords(func_getRelationID('sys.type.basket', 'sys.type.item'), 'sys.lang.nl');
select * from tmp_relations;


select
	rela_parent_id as bask_id,
    rela_parent_code as bask_code,
    rela_parent_desc as bask_desc,
	rela_child_id as item_id,
    rela_child_code as item_code,
    rela_child_desc as item_desc,
	0 as item_order,
    0 as item_count
-- select *
from tmp_relations;

CALL purejs_gdpr.stp_getBasketItems(0, 'INTK');


-- CALL stp_upsertRelation('sys.type.entity', 'sys.type.answer', @bait_id);
SELECT func_getParentPath('sys.type.entity', 'sys.type.answer');

/*
-- {ques_id: 5, answer: "quop_199", entity_id: 0}
SELECT @entity_id;
SELECT func_getRecordID('sys.type.entity', 'sys.attr.code', 'SYS');
SELECT func_getDimensionID('sys.attr.code');
CALL stp_upsertRelationRecord(func_getDimensionID('sys.type.entity.question'), @entity_id, 5, 0, @enti_ques_idd);
SELECT @enti_ques_idd;
SELECT *
FROM main_relation_record
JOIN main_dimension_record
  ON madr_id = marr_fk_child
JOIN main_record_value
  ON mava_fk_record = madr_fk_record
WHERE marr_id = @enti_ques_idd;

SELECT * FROM main_relation_record WHERE marr_id = @enti_ques_idd;
SELECT * FROM main_record_value WHERE mava_fk_record = @enti_ques_idd;
SELECT * FROM main_record_value WHERE mava_fk_dimension = func_getDimensionID('sys.attr.answer');
SELECT * FROM main_record_value WHERE mava_id = 199;
SELECT * FROM main_record_value ORDER BY mava_id DESC;
SELECT func_getDimensionID('sys.attr.options');
SELECT * FROM main_dimension;
SELECT func_getDimensionID('sys.attr.answer')
SELECT *
FROM main_relation_record
JOIN main_relation
  ON marl_id = marr_fk_relation
WHERE marr_fk_child = 5;

SELECT mava_value
FROM main_dimension_record
JOIN main_record_value
  ON mava_fk_record = madr_fk_record
 AND mava_fk_dimension = func_getDimensionID('sys.attr.type')
WHERE madr_id = 5;

SELECT *
				FROM main_dimension_record
				JOIN main_record_value
				  ON mava_fk_record = madr_fk_record
				 AND mava_fk_dimension = func_getDimensionID('sys.attr.type')
                 AND mava_value = 'multiple'
				WHERE madr_id = 8

*/


		CALL stp_selectRelationRecords(func_getRelationID('sys.type.basket', 'sys.type.item'), 0, 0, 'sys.lang.nl');

		SELECT
			rela_parent_id   AS bask_id,
			rela_parent_code AS bask_code,
			rela_parent_desc AS bask_desc,
			rela_child_id    AS item_id,
			rela_child_code  AS item_code,
			rela_child_desc  AS item_desc,
			0 AS item_order,
			0 item_count
		FROM tmp_relations as tmp;

SELECT
	sere.*, sele.*,
    (SELECT mava_value
	 FROM main_dimension_record
     JOIN main_record_value AS mavi
	   ON mava_fk_record = madr_fk_record
	  AND mava_fk_dimension = 4
	 WHERE madr_id = sele.sele_fk_record) as bask_value,
    (SELECT mava_value
	 FROM main_dimension_record
     JOIN main_record_value AS mavi
	   ON mava_fk_record = madr_fk_record
	  AND mava_fk_dimension = 4
	 WHERE madr_id = sere.sere_fk_record) as item_value,
	(SELECT mava_value 
	 FROM main_record_value
	 WHERE mava_fk_value = sele.sele_fk_value
	   AND mava_fk_dimension = 5) as lookup_value,
	mava.*
FROM main_selector as sele
JOIN main_selector_record AS sere
  ON sere.sere_fk_selector = sele.sele_id
JOIN main_relation_record as marr
  ON marr.marr_fk_child = sele.sele_fk_record
 AND marr.marr_fk_parent = func_getRecordID('sys.type.entity', 'sys.attr.code', 'SYS')
JOIN main_record_value AS mava
  ON mava.mava_fk_record = marr.marr_id
 AND func_runSelector(
	 func_getOptionValue(mava.mava_fk_value, mava.mava_value),
	 sele.sele_operator,
	 func_getOptionValue(sele.sele_fk_value, sele.sele_value),
	 sele.sele_type
    ) = 1;


select * from main_relation_record
where marr_fk_parent = func_getRecordID('sys.type.entity', 'sys.attr.code', 'SYS')

select sele.*, madi_code
from main_selector as sele
join main_dimension as madi
  on madi_id = sele_fk_dimension;
