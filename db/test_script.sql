
SELECT *
, func_getRecordData(func_getMareID(concat('madr_', marr_fk_parent)), 'sys.lang.nl')
, func_getRecordData(func_getMareID(concat('madr_', marr_fk_child)), 'sys.lang.nl')
FROM main_relation_record
JOIN main_dimension_record ON madr_fk_record = marr_id
WHERE marr_fk_relation = func_getDimensionID('sys.type.basket.item');

call stp_selectEndpointData();

select *
	, func_getRecordAttr(tmp_parent, 'sys.attr.desc', 'sys.lang.nl')
	, func_getRecordData(func_getMareID(concat('madr_', tmp_parent)), 'sys.lang.nl')
from
(
	select
		marr_fk_relation as tmp_relation,
        marr_fk_parent   as tmp_parent
	from main_relation_record as rel
    join main_dimension_record as madr on madr_fk_record = rel.marr_id
    where not exists
		(select 1 from main_relation_record
			where marr_fk_child = rel.marr_fk_parent)
    and not exists
		(select 1 from main_relation_record
			where marr_fk_child = rel.marr_fk_parent)
	group by marr_fk_relation, marr_fk_parent
) as tmp
join main_dimension on madi_id = tmp_relation;

select
	tmp.*,
    madi_code as dimension,
	concat('madi_', tmp_dim_id) as tmp_madi,
	concat('mare_', tmp_rec_id) as tmp_name,
	func_getRecordData(tmp_rec_id, 'sys.lang.nl')
from
(
	select madr_id as tmp_madr_id, madr_fk_dimension as tmp_dim_id, madr_fk_record as tmp_rec_id
	from main_relation_record as marr
	join main_dimension_record as madr on madr_id = marr_fk_parent
	and not exists
		(select 1 from main_relation_record
			where marr_fk_child = madr.madr_id)
	and not exists (select 1 from main_relation_record where marr_id = madr.madr_fk_record)
	group by madr_id, madr_fk_dimension, madr_fk_record
) as tmp
join main_dimension on madi_id = tmp_dim_id;

select
	marr_fk_relation  as tmp_relation,
	marr_fk_parent    as tmp_parent
from main_relation_record 
join main_dimension_record as madr on madr_id = marr_fk_parent
and not exists (select 1 from main_relation_record where marr_id = madr.madr_fk_record)
-- where marr_fk_parent in (30, 144);
group by marr_fk_relation, marr_fk_parent;


select *
, func_getRecordData(madr_fk_record, 'sys.lang.nl')
from main_relation_record as marr
join main_dimension_record as madr on madr_fk_record = marr_id
where marr_fk_parent in (30, 144)
and not exists (select 1 from main_relation_record where marr_fk_child = madr.madr_id)

select *
from main_relation_record
join main_dimension_record as madr on madr_fk_record = marr_id
where marr_id in (23, 135);


select *
, func_getRecordData(mava_fk_record, 'sys.lang.nl')
from main_record_value
join main_dimension_record on madr_fk_record = mava_fk_record
join main_dimension on madi_id = madr_fk_dimension
where mava_value = 'View Model';

-- join main_relation_record on marr_fk_parent = tmp_parent and marr_fk_relation = tmp_relation
;

		SELECT marr.marr_id
        SELECT *
        FROM main_dimension_record AS madr_c
		LEFT JOIN main_relation_record AS marr_c
           ON marr_c.marr_id = madr_c.madr_fk_record
		JOIN main_relation_record AS marr
           ON marr.marr_fk_parent = 28
		  -- AND marr.marr_fk_relation = pRelation
		  AND marr.marr_fk_child = COALESCE(marr_c.marr_fk_child, madr_c.madr_id)
		WHERE madr_c.madr_id = 406;

select func_getDimensionID('madi_19');

select *
, func_getRecordData(func_getMareID(concat('madr_', marr_fk_child)), 'sys.lang.nl')
from main_relation_record
left join main_dimension_record on madr_fk_record = marr_id
where marr_fk_parent = 28;

start transaction;
CALL stp_removeDimensionRecord(409);
commit;
select * from main_relation_record as marr
join main_dimension_record as madr on madr_id = marr_fk_parent
and not exists (select 1 from main_relation_record where marr_id = madr.madr_fk_record)
where marr_fk_parent  in (30, 144);

select * from main_dimension_record order by madr_id desc;
select * from main_record_value where mava_value = 'main' order by mava_id desc;
CALL stp_selectRecursive(28, 'sys.lang.nl', TRUE);
SELECT * FROM tmp_recursive;
-- SELECT * FROM tmp_collect_records;
SELECT *
, func_getRecordData(func_getMareID(concat('madr_', marr_fk_parent)), 'sys.lang.nl')
FROM main_relation_record WHERE marr_fk_child = 89;

            -- INSERT INTO tmp_collect_records
			SELECT
				tmp_id,
				marr.marr_fk_relation as tmp_dim_id,
				madl.madr_fk_dimension as tmp_dim_rec,
				madr.madr_id as tmp_madr_id,
				marr.marr_id as tmp_marr_id,
				tmp_madr_id as tmp_parent_id,
				-- marr.marr_fk_child as tmp_rec_id,
                madr.madr_id as tmp_rec_id,
				marr.marr_order as tmp_order,
				tmp_sort_order
			FROM tmp_recursive
			JOIN main_relation_record AS marr_link
              ON marr_link.marr_id = tmp_marr_id
			JOIN main_relation_record AS marr
			  ON marr.marr_fk_parent = marr_link.marr_fk_child
			LEFT JOIN main_dimension_record AS madr
			  ON madr.madr_fk_record = marr.marr_id
			 -- AND madr.madr_fk_dimension = marr.marr_fk_relation
			LEFT JOIN main_dimension_record AS madl
			  ON madl.madr_id = marr.marr_fk_child
			WHERE tmp_level = 1;

SELECT * FROM tmp_recursive;
SELECT * FROM main_dimension_record WHERE madr_id = 451;

SELECT * FROM tmp_collect_records;
SELECT * FROM tmp_add_records;
CALL stp_selectRecursiveLevels(369, 'sys.lang.nl', TRUE, -1, 3);
CALL stp_selectRecursiveLevels('madi_94', 'sys.lang.nl', FALSE, 0, 0);
SELECT func_getMadrID(concat('mare_', 99));
SELECT * FROM main_relation_record WHERE marr_id = 434;
SELECT * FROM main_relation_record WHERE marr_fk_parent = 107;
CALL stp_selectMeta('', 'sys.lang.nl');
select * from main_relation_record where marr_id = 349;

CALL stp_selectDimensionRecords('sys.type.entity', 'sys.lang.nl');
SELECT * FROM tmp_records;



SELECT *
FROM
(
	SELECT sele_id
	, func_getRecordAttr(sele_fk_record, 'sys.attr.desc', 'sys.lang.nl') as rec
	, sele_operator
	, func_getRecordAttr(sele_fk_value, 'sys.attr.desc', 'sys.lang.nl') as val
	, func_getRecordAttr(sere_fk_record, 'sys.attr.code', 'sys') as res_code
	, func_getRecordAttr(sere_fk_record, 'sys.attr.desc', 'sys.lang.nl') as res_desc
	FROM main_selector
	JOIN main_selector_record ON sere_fk_selector = sele_id
) AS tmp
ORDER BY LPAD(res_code, 4, '0')





USE purejs_test;

SELECT func_getRecordID('sys.app.item', 'sys.attr.code', 'system');
SELECT func_getMadrId(CONCAT('mare_', 8));
SELECT * FROM main_dimension;

SELECT *
, func_getRecordData(marr_id, 'sys.lang.nl')
, func_getRecordData(madr_fk_record, 'sys.lang.nl')
FROM main_relation_record
JOIN main_dimension_record ON madr_fk_record = marr_id;

CALL stp_removeRelationRecord(33);

CALL stp_removeDimensionRecord(355);
CALL stp_removeDimensionRecord(92);

SELECT * FROM sys_record_data;

SELECT * FROM main_dimension_record;
SELECT * FROM main_record_value;

SELECT * FROM main_record_value WHERE mava_value = 'input';
CALL stp_selectDimension('madi_26', 'sys.lang.nl');
CALL stp_selectMeta('', 'sys.lang.nl');
SELECT func_getRecordData(3, 'sys.lang.nl');

SELECT * FROM main_record_value
LEFT JOIN main_dimension ON madi_id = mava_fk_record
WHERE mava_value = 'input';

SELECT * FROM main_dimension
LEFT JOIN main_relation ON marl_id = madi_id
ORDER BY madi_code;
SELECT * FROM main_record_value WHERE mava_fk_record = 410;
SELECT * FROM main_dimension_record WHERE madr_fk_dimension = 2;

SELECT * FROM main_relation_record
WHERE marr_fk_child = 38

SELECT * FROM main_record_value
JOIN main_dimension_record ON madr_fk_record = mava_fk_record
WHERE madr_id = 233;

show create table main_record_value;

ALTER TABLE main_record_value
DROP FOREIGN KEY `fk_mava_mava_01`; -- FOREIGN KEY (`mava_fk_value`) REFERENCES `main_record_value` (`mava_id`)

ALTER TABLE main_record_value
DROP INDEX fk_mava_mava_01_idx;

ALTER TABLE main_record_value
  ADD CONSTRAINT `fk_mava_mare_03`
    FOREIGN KEY (`mava_fk_value`)
    REFERENCES `purejs_test`.`main_record` (`mare_id`)

CALL stp_selectRecursiveLevels(415, 'sys.lang.nl', FALSE, 2, 1);

SELECT * FROM main_record_value 
-- jOIN main_dimension ON madi_id = mava_fk_dimension
WHERE mava_fk_record in (429, 605) ORDER BY mava_id DESC;
SELECT * FROM main_dimension_record ORDER BY madr_id DESC;

SELECT func_getRecordData(605, 'sys.lang.nl');
START transaction;
CALL stp_removeDimensionRecord(618);
ROLLBACK;
COMMIT;
select * from main_relation_record
Error Code: 1451. Cannot delete or update a parent row: a foreign key constraint fails (`purejs_test`.`main_relation_record`, CONSTRAINT `pk_marr_mare_01` FOREIGN KEY (`marr_id`) REFERENCES `main_record` (`mare_id`) ON DELETE NO ACTION ON UPDATE NO ACTION)


SELECT *
, func_getRecordData(madr_fk_record, 'sys.lang.nl')
FROM main_dimension_record AS madr
JOIN main_dimension AS madi
  ON madi.madi_id = madr.madr_fk_dimension
LEFT JOIN main_dimension AS is_madi
  ON is_madi.madi_id = madr.madr_fk_record

SELECT * FROM main_relation_record;

SELECT *
, func_getRecordData(mava_fk_record, 'sys.lang.nl')
, (SELECT mava_value FROM main_record_value WHERE mava_id = v.mava_fk_value)
FROM main_record_value AS v
WHERE mava_fk_dimension = 406;

SELECT *
, func_getRecordData(mava_fk_record, 'sys.lang.nl')
FROM main_record_value WHERE mava_id = 233;

start transaction;
delete madr
from main_dimension_record as madr
join (
	select madr_fk_dimension, madr_fk_record, min(madr_id) as keep_id
	from main_dimension_record
	group by madr_fk_dimension, madr_fk_record
	having count(*) > 1
) as tmp
on tmp.madr_fk_dimension = madr.madr_fk_dimension 
and tmp.madr_fk_record = madr.madr_fk_record
and tmp.keep_id != madr.madr_id;

call stp_selectMeta('', 'sys.lang.nl');

commit;

		SELECT
			madi.madi_id,
			func_getRecordData(madi.madi_id, 'sys.lang.nl') as madi_meta,
			func_getRecordData(madi.madi_fk_parent, 'sys.lang.nl') as madi_parent_meta,
			CONCAT('[ ', GROUP_CONCAT(DISTINCT func_getRecordData(is_madi.madi_id, 'sys') SEPARATOR ', '), ' ]') as madi_fields,
			COALESCE((SELECT CONCAT('[ ', GROUP_CONCAT(CONCAT('{ "id": ', madi_id, ', "marl": ', marl_id, ', "code": "', madi_code, '" }') SEPARATOR ', '), ' ]')
				FROM main_relation
				JOIN main_dimension ON madi_id = marl_fk_child_dimension
					WHERE marl_fk_parent_dimension = madi.madi_id), '[]') as madi_nodes
		-- SELECT *
		FROM main_dimension AS madi
        JOIN main_dimension_record AS madr
		  ON madr.madr_fk_dimension = madi.madi_fk_root -- IN (madi.madi_fk_root, madi.madi_id)
		JOIN main_dimension AS is_madi
		  ON is_madi.madi_id = madr.madr_fk_record
		GROUP BY madi.madi_id
		ORDER BY madi.madi_code;

SELECT *
, func_getRecordData(madr_fk_record, 'sys.lang.nl')
, func_getRecordData((select madr_fk_record from main_dimension_record where madr_id = rel.marr_fk_parent), 'sys.lang.nl')
, func_getRecordData((select madr_fk_record from main_dimension_record where madr_id = rel.marr_fk_child), 'sys.lang.nl')
FROM main_relation_record AS rel
LEFT JOIN main_dimension_record ON madr_fk_record = marr_id;

insert into main_dimension_record
select 0, madr_fk_dimension, marr_id, marr_order
from main_relation_record as marr
join main_dimension_record as madr on madr_id = marr_fk_child
where not exists
	(select 1 from main_dimension_record
		where madr_fk_dimension = madr.madr_fk_dimension
			and madr_fk_record = marr.marr_id);

SELECT * FROM main_record_value;
SELECT *
, func_getRecordData(madr_fk_record, 'sys.lang.nl')
FROM main_dimension_record
JOIN main_record ON mare_id = madr_fk_record
ORDER BY madr_id DESC;
CALL stp_selectRecursive(7, 'sys.lang.nl', false);
CALL stp_selectRecursive(360, 'sys.lang.nl', true);

CALL stp_selectRecursive(336, 'sys.lang.nl', true);
select * from main_record_value where mava_fk_record = 60;
SHOW PROCESSLIST;



SELECT * FROM sys_record_data;

TRUNCATE TABLE sys_record_data;

INSERT IGNORE INTO sys_record_data SELECT * FROM sys_record_data_queue;

CALL stp_selectRecursiveLevels('madi_20', 'sys.lang.nl', false, 0);

		SELECT
			madi.madi_id,
			func_getRecordData(madi.madi_id, 'sys.lang.nl') as madi_meta,
			CONCAT('[ ', GROUP_CONCAT(func_getRecordData(is_madi.madi_id, 'sys.lang.nl') SEPARATOR ', '), ' ]') as madi_fields,
			COALESCE((SELECT CONCAT('[ ', GROUP_CONCAT(CONCAT('{ "id": ', madi_id, ', "code": "', madi_code, '" }') SEPARATOR ', '), ' ]')
				FROM main_relation
				JOIN main_dimension ON madi_id = marl_fk_child_dimension
					WHERE marl_fk_parent_dimension = madi.madi_id), '[]') as madi_nodes 
		FROM main_dimension_record AS madr
		JOIN main_dimension AS is_madi
		  ON is_madi.madi_id = madr.madr_fk_record
		JOIN main_dimension AS madi
		  ON madi.madi_id = madr.madr_fk_dimension
		-- WHERE (madr.madr_fk_dimension = DimID OR DimID = 0)
        WHERE madr_id = 5
		GROUP BY madi.madi_id
		ORDER BY madi.madi_code;

select * from main_dimension order by madi_code;
select * from main_dimension_record where madr_id = 120;

CALL stp_upsertDimensionRecord('sys.attr', 'code', @code_id);
-- !CORRIGEREN!
CALL stp_upsertDimensionRecord('sys.attr', 'type', @type_id);
CALL stp_upsertDimensionRecord('sys.attr', 'desc', @desc_id);
CALL stp_upsertDimensionRecord('sys.attr', 'options', @options_id);
CALL stp_upsertDimensionRecord('sys.attr', 'answer', @answer_id);
CALL stp_upsertDimensionRecord('sys.attr', 'class', @class_id);
CALL stp_upsertDimensionRecord('sys.attr', 'label', @label_id);
CALL stp_upsertDimensionRecord('sys.attr', 'prefix', @prefix_id);
CALL stp_upsertDimensionRecord('sys.attr', 'tag', @tag_id);
CALL stp_upsertDimensionRecord('sys.attr', 'icon', @icon_id);

CALL stp_upsertRelation('sys.attr', 'sys.attr', @rela_id);
SELECT * FROM main_dimension ORDER BY madi_code;
CALL stp_upsertRelationRecord(func_getDimensionID('sys.attr.attr'), @code_id, @label_id, 0, @attr_id);

CALL stp_upsertDimensionRecordValue(@code_id, 'sys.attr', 'sys.lang.nl', 'Dashboard', 0, @attr_id);

CALL stp_upsertDimensionRecordValue(func_getDimensionID('sys.attr.code'), @label_id, 'sys.lang.nl', 'Code', 0, @attr_id);
CALL stp_upsertDimensionRecordValue(func_getDimensionID('sys.attr.code'), @type_id, 'sys', 'string', 0, @attr_id);
CALL stp_upsertDimensionRecordValue(func_getDimensionID('sys.attr.code'), @tag_id, 'sys', 'input', 0, @attr_id);
CALL stp_upsertDimensionRecordValue(func_getDimensionID('sys.attr.desc'), @label_id, 'sys.lang.nl', 'Omschrijving', 0, @attr_id);
CALL stp_upsertDimensionRecordValue(func_getDimensionID('sys.attr.desc'), @type_id, 'sys', 'string', 0, @attr_id);
CALL stp_upsertDimensionRecordValue(func_getDimensionID('sys.attr.desc'), @tag_id, 'sys', 'input', 0, @attr_id);
CALL stp_upsertDimensionRecordValue(func_getDimensionID('sys.attr.type'), @label_id, 'sys.lang.nl', 'Type', 0, @attr_id);
CALL stp_upsertDimensionRecordValue(func_getDimensionID('sys.attr.type'), @type_id, 'sys', 'string', 0, @attr_id);
CALL stp_upsertDimensionRecordValue(func_getDimensionID('sys.attr.type'), @tag_id, 'sys', 'input', 0, @attr_id);
CALL stp_upsertDimensionRecordValue(func_getDimensionID('sys.attr.class'), @label_id, 'sys.lang.nl', 'Class', 0, @attr_id);
CALL stp_upsertDimensionRecordValue(func_getDimensionID('sys.attr.class'), @type_id, 'sys', 'string', 0, @attr_id);
CALL stp_upsertDimensionRecordValue(func_getDimensionID('sys.attr.class'), @tag_id, 'sys', 'input', 0, @attr_id);
CALL stp_upsertDimensionRecordValue(func_getDimensionID('sys.attr.icon'), @label_id, 'sys.lang.nl', 'Icon', 0, @attr_id);
CALL stp_upsertDimensionRecordValue(func_getDimensionID('sys.attr.icon'), @type_id, 'sys', 'string', 0, @attr_id);
CALL stp_upsertDimensionRecordValue(func_getDimensionID('sys.attr.icon'), @tag_id, 'sys', 'fas', 0, @attr_id);

select madi.*, madr.*,
func_getRecordData(madr_fk_record, func_getDimensionID('sys.lang.nl'))
from main_dimension_record as madr
join main_dimension as madi
  on madi.madi_id = madr.madr_fk_dimension
where madi_code like 'sys.app%'
order by madi_code, madi_id;

select func_getRelationID('madi_163', 'madi_163');

select * from main_record_value
join main_dimension_record on madr_fk_record = mava_fk_record
order by mava_id;

select * from main_record_value
join main_dimension on madi_id = mava_fk_record
order by madi_code, mava_id desc;


select * from main_record_value where mava_fk_record = 162;

select *
from main_record_value as t1
left join main_record_value as t2
  on t1.mava_fk_record = t2.mava_fk_record and t2.mava_fk_dimension = 3
  and t2.mava_fk_language = 1
where t1.mava_fk_dimension = 3 and t1.mava_fk_language != 1;

delete t1 from main_record_value as t1
where t1.mava_fk_dimension = 3 and t1.mava_fk_language != 1;

select * from main_record_value 
where mava_fk_record = 203
order by mava_id desc;
select * from main_relation_record
where marr_fk_parent = 97;
order by marr_id desc;

SELECT func_getRelationID('madi_12', 'madi_200');
-- 201
SELECT func_getMadrID(22);
-- 6
SELECT * FROM main_relation_record ORDER BY marr_id DESC;
START TRANSACTION;
CALL stp_removeRelationRecords(201, 6, '108,113');
SELECT * FROM main_relation_record ORDER BY marr_id DESC;
SELECT * FROM tmp_relations;
ROLLBACK;

select func_getMadrID('madr_106');

delete from main_record_value where mava_fk_record = 202;
delete from main_dimension_record where madr_fk_record = 203;
delete from main_record where mare_id = 202;

select func_getDimensionID('madi_12');

SELECT func_getRecordID('sys.app.item', 'sys.attr.code', 'main');

select * from main_dimension order by madi_code desc;
select * from main_dimension_record where madr_fk_record = 203;
select *
, func_getRecordData(madr.madr_fk_record, func_getDimensionID('sys.lang.nl'))
from main_relation_record
join main_dimension_record as madr on madr.madr_id = marr_fk_child
left join main_dimension_record as madr_check on madr_check.madr_fk_record = marr_id
order by marr_id desc;

delete from main_dimension_record where madr_id = 265;
delete from main_relation_record where marr_id = 292;
delete from main_record_value where mava_fk_record = 292;
delete from main_record where mare_id = 292;

update main_relation_record set marr_fk_parent = 355 where marr_id = 329;

insert into main_dimension_record select 0, marr_fk_relation, marr_id, 0 from main_relation_record where marr_id = 334;

insert into main_dimension_record
select 0, marr_fk_relation, marr_id, 0
from main_relation_record as rel
where not exists (select 1 from main_dimension_record
	where madr_fk_dimension = rel.marr_fk_relation and madr_fk_record = rel.marr_id);

select *
from main_dimension_record
join main_relation_record on marr_id = madr_fk_record and marr_fk_relation = madr_fk_dimension;

select *,
func_getRecordData(madr_fk_record, func_getDimensionID('sys.lang.nl'))
delete
from main_dimension_record
where madr_fk_record in (123,122,198)
and madr_fk_dimension not in (2,12)
order by madr_id desc;
use purejs_db;
CALL stp_selectRecords('sys.type.basket', 'sys.lang.nl');
SELECT * FROM tmp_records;
CALL stp_selectMeta('madi_163', 'sys.lang.nl');

CALL stp_selectData('madi_14', 'sys.lang.nl', TRUE);
CALL stp_selectDimensionRecords('madi_33', 'sys.lang.nl');
SELECT * FROM tmp_records;

CALL stp_selectDimensionRecords('sys.type.app.item', 'sys.lang.nl');
SELECT * FROM tmp_records;

CALL stp_selectDimensionRecords('sys.app.item.type.module', 'sys.lang.nl');
SELECT * FROM tmp_records;
CALL stp_selectDimensionRecords('sys.type%', 'sys.lang.nl');
SELECT * FROM tmp_records;



DROP TABLE tmp_records;
CALL stp_selectDimensionRecords('sys.type.question', 'sys.lang.nl');
SELECT * FROM tmp_records;
SELECT func_getMadrID('mare_218');

select * from main_dimension_record where madr_fk_record = 218;
select * from main_dimension_record where madr_id in (114, 120);
select * from main_relation_record where marr_id in (218, 249);

select *
, func_getRecordData(madr_fk_record, func_getDimensionID('sys.lang.nl'))
from main_dimension_record
where madr_fk_dimension = func_getDimensionID('sys.app.item.item');

SELECT func_getRecordData(218, func_getDimensionID('sys.lang.nl'));

select func_getRecordId('sys.type.module', 'sys.attr.code', 'components');
-- 353
call stp_selectRecursive(337, 'sys.lang.nl', TRUE);

select * from main_dimension order by madi_code;
select * from main_record_value where mava_value like 'Tree%';
select * from main_dimension_record where madr_fk_dimension in (52, 370);
select * from main_dimension_record where madr_fk_record in (53, 372);
select * from main_record_value where mava_fk_record in (53, 372);

select * from sys_record_data;
truncate table sys_record_data;

call stp_selectRecursive(114, 'sys.lang.nl', false);
call stp_selectRecursive(120, 'sys.lang.nl', false);
call stp_selectRecursive(356, 'sys.lang.nl', false);
call stp_selectRecursive(355, 'sys.lang.nl', false);
call stp_selectRecursive(334, 'sys.lang.nl', false);
call stp_selectRecursive(454, 'sys.lang.nl', false);
SELECT * FROM main_relation_record
JOIN main_dimension_record ON madr_id = marr_fk_child
WHERE marr_id = 334;

select func_getMadrID('mare_35');
select func_getMadrID('marr_35');
call stp_selectMeta('', 'sys.lang.nl');
call stp_selectRecursive('marr_36', 'sys.lang.nl', true);

call stp_selectDimension('sys.app.item.item', 'sys.lang.nl');

select * from main_relation_record
left join main_dimension_record on madr_fk_record = marr_id
where marr_fk_parent in (97, 114, 120, 90, 121);

update main_dimension_record
set madr_fk_dimension = 225 where madr_id in (120, 121, 122);

delete from main_dimension_record where madr_id in (445, 447, 451);

DROP TEMPORARY TABLE IF EXISTS tmp_records;
CREATE TEMPORARY TABLE tmp_records AS SELECT 311 AS tmp_id;

SELECT DISTINCT
			0, madr.madr_fk_dimension, madr.madr_fk_dimension,
            coalesce(madrel.madr_id, madr.madr_id),
            madr.madr_id as tmp_marr_id,
            0 as tmp_parent_id,
            madr.madr_id, 0, '00000'
            SELECT *
		FROM tmp_records AS tmp
		JOIN main_dimension_record AS madr ON madr.madr_id = tmp.tmp_id
        LEFT JOIN main_relation_record AS link ON link.marr_id = madr.madr_fk_record AND link.marr_fk_relation = madr.madr_fk_dimension
        LEFT JOIN main_relation AS marl ON marl.marl_id = link.marr_fk_relation;

        
		LEFT JOIN main_relation_record AS link ON link.marr_fk_child = madr.madr_id
        LEFT JOIN main_dimension_record AS madrel ON madrel.madr_fk_record = link.marr_id AND madrel.madr_fk_dimension = link.marr_fk_relation
		WHERE link.marr_id IS NULL OR madrel.madr_id IS NOT NULL;

SELECT func_getRecordData(322, func_getDimensionID('sys.lang.nl'));

select *
, func_getRecordData(madr.madr_fk_record, func_getDimensionID('sys.lang.nl'))
from main_relation_record
join main_dimension_record as madr on madr.madr_id = marr_fk_child
left join main_dimension_record as madr_check on madr_check.madr_fk_record = marr_id
order by marr_id desc;

select * from tmp_add_records;
select * from tmp_recursive;
select * from tmp_collect_records;
select func_getParentPath('sys.attr.test', 'sys.attr.test4', false);

CALL stp_selectDimensionRecords('sys.attr.tag', 'sys.lang.nl');
SELECT * FROM tmp_records;

select *, concat('Route::get(\'', tmp_path, '/{code?}\', \'DbController@getRecords',
	UCASE(LEFT(tmp_prefix, 1)), SUBSTRING(tmp_prefix, 2), UCASE(LEFT(tmp_name, 1)), SUBSTRING(tmp_name, 2), '\');') as tmp_route
from
(
	select
		substring_index(tmp_path, '/', -1) as tmp_name,
        case when locate('/', tmp_path, 2) > 0 then substring_index(tmp_path, '/', 1) else '' end as tmp_prefix,
        tmp_path
	from
	(
		select
			replace(substring_index(replace(madi_code, 'sys.', ''), '.', case when madi_code like 'sys.type%' then 2 else 1 end), '.', '/') as tmp_path
		from main_dimension
		where madi_fk_root > 1
		group by tmp_path
	) as tmp
	order by tmp_path
) as tmp;


CALL stp_deleteDimension('sys.attr.tag.options', false, false);

CALL stp_selectMeta('madi_10', 'sys.lang.nl');
CALL stp_selectMeta('', 'sys.lang.nl');

CALL stp_upsertDimensionRecordValue(337, 'sys.attr.answer', 18, 'mare_300,mare_301', TRUE, @val_id);
CALL stp_upsertDimensionRecordValue(347, 'sys.attr.desc', 18, 'Tree Nav Generic', FALSE, @val_id);


select func_getMareID('madr_45');
CALL stp_selectRecursive(331, 'sys.lang.nl', TRUE);

select * from main_dimension_record
join main_dimension on madi_id = madr_fk_record
where madr_fk_dimension in (61);

select * from main_dimension_record where madr_fk_dimension = 61;

select *
, func_getRecordAttr(marr_fk_child, 'sys.attr.type', 1)
from main_relation_record
where marr_id = 352;

select * from main_dimension order by madi_code;
select * from main_record_value where mava_fk_dimension = 10;
select * from main_record_value where mava_fk_dimension = 388;
select func_getRecordData(func_getMareID('madr_337'), func_getDimensionID('sys.lang.nl'));

select *, func_getRecordData(madr_fk_record, func_getDimensionID('sys.lang.nl'))
from main_dimension_record where madr_fk_dimension = 10;

select *
, func_getRecordID('sys.attr.tag', 'sys.attr.code', mava_value)
from main_record_value where mava_fk_dimension = 10;

delete from main_record_value where mava_id = 858;

update main_record_value
join main_dimension_record on madr_id = func_getRecordID('sys.attr.tag', 'sys.attr.code', mava_value)
set mava_fk_value = madr_fk_record
where mava_fk_dimension = 10;

truncate table sys_record_data;

select * from sys_record_data;

CALL stp_selectRecursiveLevels('madi_10', 'sys.lang.nl', FALSE, 0, 0);

select * from main_relation_record
left join main_dimension_record on madr_id = marr_fk_child
where marr_fk_relation = 225
and marr_fk_parent = 120;

SELECT * FROM tmp_recursive;
SELECT * FROM tmp_records;
select func_getDimensionID('madi_14');
SELECT *,
func_getRecordData(madr_fk_record, func_getDimensionID('sys.lang.nl'))
FROM main_relation_record
LEFT JOIN main_dimension_record ON madr_id = marr_fk_child
-- WHERE marr_fk_relation in (func_getDimensionID('sys.app.menu.item'), func_getDimensionID('sys.app.item.item')) -- IN (164, 182)
ORDER BY marr_id DESC;

SELECT func_getRecordData(mare_id, 'sys.lang.nl')
FROM main_record
WHERE mare_id IN (62,63);

select * from main_dimension order by madi_code;
select *
, func_getRecordData(madr_fk_record, func_getDimensionID('sys.lang.nl'))
from main_dimension_record
-- join main_relation_record on marr_fk_parent = madr_id
where madr_fk_dimension = 16;

select * from main_selector;

SELECT *
UPDATE main_relation_record
set marr_fk_relation = 225
WHERE marr_fk_relation in (func_getDimensionID('sys.app.menu.item'), func_getDimensionID('sys.app.item.item')) -- IN (164, 182)
ORDER BY marr_id DESC;


SELECT * FROM main_dimension ORDER BY madi_id DESC;
SELECT * FROM main_dimension_record ORDER BY madr_id DESC;
SELECT * FROM main_record ORDER BY mare_id DESC;
DELETE FROM main_record_value WHERE mava_fk_record = 287;

delete from main_record_value where mava_fk_record > 284;
delete from main_dimension_record where madr_fk_record > 284;
delete from main_relation_record where marr_id > 284;
delete from main_record where mare_id > 284;

CALL stp_deleteDimension(func_getRelationID('sys.app.menu.item', 'sys.app.item'), FALSE, FALSE);
SELECT func_getRelationID('sys.app.menu.item', 'sys.app.item');


SELECT * FROM main_relation ORDER BY marl_id DESC;
SELECT func_getRelationID('madi_12', 'madi_200');

SELECT func_getRecordData(5, 'sys.lang.nl');

	SELECT *,
	func_getRecordData(madi_id, 'sys.lang.nl')
	FROM main_dimension 
	LEFT JOIN main_relation ON marl_id = madi_id
	ORDER BY madi_code;
-- WHERE madi_id = 15;
SELECT func_getMadrID('mare_21');
SELECT func_getMadrID('mare_28');

SELECT *
FROM main_dimension
JOIN main_relation
  ON marl_id = madi_id;

SELECT * FROM main_dimension WHERE madi_id in (155, 156,157,158);
SELECT func_getRecordData(155, 'sys.lang.nl');

SELECT * FROM main_record_value ORDER BY mava_id DESC;

CALL stp_deleteDimension('madi_614', TRUE, FALSE);

select * from main_dimension_record where madr_fk_record = 614;

SELECT * FROM main_record_value where mava_fk_record = 614;
DELETE FROM main_record_value where mava_fk_record = 614;

select * from main_relation where marl_id = 614;

delete from main_relation where marl_id = 614;

delete from main_dimension where madi_id = 614;

delete from main_record where mare_id = 614;

SELECT *
FROM main_dimension_record
JOIN main_dimension
  ON madi_id = madr_fk_dimension
JOIN main_record_value
  ON mava_fk_record = madr_fk_record
WHERE madr_fk_record = 21;

-- SELECT * FROM main_dimension ORDER BY madi_code;

select * from main_dimension where madi_id = 316;

select * from main_dimension_record where madr_fk_dimension = 316;

select *
, func_getRecordData(marr_id, 'sys.lang.nl')
from main_relation_record
left join main_dimension_record on madr_fk_record = marr_id
where marr_fk_relation = 316;

insert into main_dimension_record values (0, 316, 319, 0);
insert into main_dimension_record values (0, 316, 320, 0);


select * from main_relation_record;

		SELECT
			CONCAT(
				'"', madi_group, '": { ',
				GROUP_CONCAT(CONCAT('"', madi_name, '": "', mava_value, '"') ORDER BY madi_name SEPARATOR ', '),
				' }') AS json
		FROM
		(
			SELECT
				madi_code,
                REPLACE(REPLACE(madi_code, concat('.', substring_index(madi_code, '.', -1)), ''), 'sys.', '') as madi_group,
				substring_index(madi_code, '.', -1) as madi_name,
				mava.mava_value
			FROM main_record_value AS mava
			JOIN main_dimension AS madi
			  ON madi.madi_id = mava.mava_fk_dimension
			WHERE mava.mava_fk_record = 163
			  -- AND mava_fk_language = CASE WHEN madi_code = 'sys.attr.code' THEN 1 ELSE COALESCE(NULLIF(pLanguageID, 0), 1) END
			  AND madi_code != 'sys.attr.options'
		) AS tmp
		GROUP BY madi_group


