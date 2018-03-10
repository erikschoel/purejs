
alter table main_relation add marl_include_yn tinyint default 1 not null;

select * from main_relation;

update main_relation set marl_include_yn = 1 where marl_id !=174;

insert into main_dimension_record
select *
from
(
	select
		0 as madr_id, madi_id as madr_fk_dimension, func_getDimensionID('sys.attr.desc') as madr_fk_record, 0 as madr_order
	from main_dimension as madi
    where madi_code like 'sys.type%'
    and not exists (select 1 from main_relation where marl_id = madi.madi_id)
) as tmp
where not exists
	(select 1 from main_dimension_record
		where madr_fk_dimension = tmp.madr_fk_dimension
          and madr_fk_record = tmp.madr_fk_record);

call stp_selectRecords('%', 'sys.lang.nl');
select * from tmp_records;
select func_getRelationID('sys.type.endpoint', 'sys.type.entity');
select func_getMadrID('mare_36');
select func_getDimensionID('madi_410');
select func_getDimensionID('sys.type.app.item.item.module.type');


CALL stp_upsertDimension('sys.meta', 'query', @meta_query_id);
CALL stp_upsertRecordValue(func_getDimensionID('sys.type.app.item.item.module.any'), @meta_query_id, 'sys', 'lookup', 0, @attr_id);			

alter table main_relation add marl_use_dim_yn tinyint unsigned default 0 not null;
call stp_selectMeta('', 'sys.lang.nl');
call stp_selectDimensionRecords('sys.type.entity', 'sys.lang.nl');
select * from tmp_records;
select func_getDimensionID('madi_41');
use purejs_test;

select *
, func_getRecordData(madr_fk_record, func_getDimensionID('sys.lang.nl'))
, func_getRecordData(func_getMareID(concat('madr_', marr_fk_parent)), func_getDimensionID('sys.lang.nl'))
from main_dimension_record as madr
join main_dimension on madi_id = madr_fk_dimension
join main_record_value on mava_fk_record = madr_fk_record
left join main_relation_record on marr_fk_child = madr_id
-- where madi_code like '%department%'
-- where madr_id in (443, 450, 361, 47)
where 1=1
and not exists (select 1 from main_dimension where madi_id = madr.madr_fk_record)
order by madr_id desc;



-- 341, 354, 466
call stp_selectRecursive(469, 'sys.lang.nl', TRUE);
call stp_selectRecursive(341, 'sys.lang.nl', TRUE);
call stp_selectRecursive(354, 'sys.lang.nl', TRUE);
call stp_selectRecursive(466, 'sys.lang.nl', TRUE);

call stp_removeDimensionRecord(450);


insert into tmp_updates values (0, 1002, 'Menu Tree');
insert into tmp_updates values (0, 1003, 'tree');

insert into tmp_updates values (0, 826, func_getUUID());
insert into tmp_updates values (0, 828, 'Load Enpoint');
insert into tmp_updates values (0, 829, 'load');

select * from tmp_updates;

update main_record_value as mava
join tmp_updates on tmp_mava_id = mava_id
set mava_value = tmp_mava_value;


insert into tmp_updates values (0, 829, 'tree');



create temporary table tmp_updates (
	tmp_id int not null auto_increment,
	tmp_mava_id int not null,
	tmp_mava_value varchar(255) not null,
	primary key (tmp_id)
);


select *
, func_getRecordData(madr_fk_record, 'sys.lang.nl')
from main_dimension_record
join main_record on mare_id = madr_fk_record
where madr_fk_dimension = 72;

call stp_selectMeta('', 'sys.lang.nl');
show processlist;

select * from main_dimension order by madi_code;
-- select * from main_relation order by marl_id;-- _code;
-- select * from main_record_value where mava_fk_record in (56, 64) order by mava_id desc;
select *,
func_getRecordData(madr_fk_record, func_getDimensionID('sys.lang.nl'))
from main_dimension_record as madr
join main_dimension on madi_id = madr_fk_dimension
join main_record on mare_id = madr_fk_record
join main_record_value on mava_fk_record = madr_fk_record
-- where mava_fk_record = 40
order by coalesce(mava_modified_on, mava_created_on) desc, mava_fk_record desc;

update main_record_value set mava_value = 'organisation' where mava_id = 983;

select * from main_record order by mare_id desc;
select * from main_dimension_record order by madr_id desc;
select * from main_relation_record order by marr_id desc;
select * from sys_record_data;

select * from main_record_value 
join main_record on mare_id = mava_fk_record
where mava_value like 'afd%' order by mava_value desc;

select *
from main_dimension
left join main_relation on marl_id = madi_id
where madi_id in (func_getDimensionID('madi_380'), func_getDimensionID('madi_381'));

select *
-- , func_getRecordData(madr_fk_record, 'sys.lang.nl')
, func_getRecordAttr(madr_id, 'sys.attr.code', 'sys')
from main_dimension_record
join main_dimension on madi_id = madr_fk_dimension
where madr_fk_dimension = func_getDimensionID('sys.type.app.item')
and (madr_id = 446 or madr_fk_record in (453, 460))
and not exists (select 1 from main_dimension where madi_id = madr_fk_record);

select * from main_relation_record
join main_dimension_record on madr_fk_record = marr_id
where marr_fk_parent in (28, 336) or marr_fk_child in (28, 336);

select *
, func_getRecordData(madr_fk_record, 'sys.lang.nl')
from main_relation_record
join main_dimension_record on madr_fk_record = marr_id
join main_dimension on madi_id = madr_fk_dimension
where marr_fk_parent in (29, 339) or marr_fk_child in (29, 339);

select *
, func_getRecordData(madr_fk_record, 'sys.lang.nl')
, func_getRecordAttr(madr_id, 'sys.attr.code', 'sys')
from main_dimension_record
where madr_fk_dimension = 57;

select * from main_record_value
join main_dimension_record on madr_fk_record = mava_fk_record
join main_dimension on madi_id = madr_fk_dimension
-- where mava_value like '%program-tree%';
where mava_value like '%menu%';

update main_dimension_record set madr_fk_dimension = 57 where madr_id = 441;

truncate table sys_record_data;
select func_getRecordData(86, 'sys.lang.nl');
update main_record_value set mava_value = 'sysstem' where mava_id = 1;
select * from main_record_value where mava_fk_record = 86;
select * from main_record
join main_record_value on mava_fk_record = mare_id
order by mare_modified_on desc
limit 100;


start transaction;

CALL stp_upsertDimensionRecord('madi_380', 'afd-5', @rec_id);

SELECT @rec_id;
ROLLBACK;
select
                    madr_id as id, mava_value as code, madr_fk_record as rec_id
                    from main_dimension_record
                        join main_record_value
                            on mava_fk_record = madr_fk_record
                           and mava_fk_dimension = func_getDimensionID('sys.attr.code')
                           and mava_fk_language = 1
                    where madr_id = @rec_id;
                    
-- CALL stp_upsertRecordValue(:record_id, :dimension, :language, :value, :lookup, @val_id)
-- {"record_id":"381","dimension":"sys.attr.code","language":19,"value":"afd-5","lookup":false} 
				
-- CALL stp_upsertRecordValue(:record_id, :dimension, :language, :value, :lookup, @val_id)
-- {"record_id":"381","dimension":"sys.attr.desc","language":19,"value":"Afdeling 5","lookup":false}
                    




alter table main_record_value
add mava_created_on DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

alter table main_record_value
add mava_modified_on DATETIME NULL ON UPDATE CURRENT_TIMESTAMP;

commit;
show create table main_relation;
select * from sys_transaction_log;

select * from main_relation where marl_fk_child_dimension = func_getDimensionID('sys.type.any') or marl_fk_parent_dimension = func_getDimensionID('sys.type.any');

alter table main_relation
add `marl_share_parent_attrs_yn` TINYINT UNSIGNED DEFAULT 0 NOT NULL;
alter table main_relation
add `marl_share_child_attrs_yn` TINYINT UNSIGNED DEFAULT 0 NOT NULL;




			SELECT *
			FROM main_dimension_record AS madr
            JOIN main_record ON mare_id = madr_fk_record
            LEFT JOIN main_relation_record ON marr_id = madr_fk_record
			WHERE madr_fk_dimension = func_getDimensionID('madi_94')
            AND NOT EXISTS
				(SELECT 1 FROM main_dimension WHERE madi_id = madr.madr_fk_record)
            AND NOT EXISTS
				(SELECT 1 FROM main_relation_record WHERE marr_id = madr.madr_fk_record)
                
			UNION
            
            SELECT 0, madr_id
            FROM main_relation_record AS marr
            JOIN main_dimension_record AS madr ON madr_fk_record = marr_id
            WHERE marr_fk_relation = func_getDimensionID('madi_94')
            
            ORDER BY madr_id;

select *
, func_getRecordData(mava_fk_record, func_getDimensionID('sys.lang.nl'))
from main_dimension_record
left join main_record_value as mava on mava_fk_record = madr_fk_record
join main_dimension on madi_id = madr_fk_dimension
where madi_code like '%item%'
and not exists (select 1 from main_dimension where madi_id = mava.mava_fk_record)
and mava_fk_dimension = func_getDimensionID('sys.attr.route')
order by mava_fk_record, mava_fk_dimension;

select * from sys_record_data where syrd_fk_record in(59, 60,386,383);

call stp_selectDimension('madi_72', 'sys.lang.nl');
CALL stp_selectRecursiveLevels('madi_72', 'sys.lang.nl', FALSE, 0, 0)
	
truncate table sys_record_data;
insert into sys_record_data
select 0, mare_id, lang.madi_id, UNIX_TIMESTAMP(COALESCE(mare_modified_on, mare_created_on)), func_getRecordData(mare_id, lang.madi_id)
from main_record as mare
join main_dimension as lang on lang.madi_code = 'sys.lang.nl'
where exists (select 1 from main_record_value where mava_fk_record = mare.mare_id and mava_fk_dimension != func_getDimensionID('sys.attr.code'));

CALL stp_removeDimensionRecord(372);

call stp_deleteDimension(361, FALSE, TRUE);

select * from main_record_value where mava_fk_record in (53, 380, 382);

select *, func_getRecordData(mare_id, 'sys.lang.nl') from main_record 
where mare_id in (53, 380, 382)
order by mare_modified_on desc;

select func_getRecordID('sys.type.entity', 'sys.attr.code', 'SYS');
select func_getMadrID('mare_54');
select * from main_dimension_record where madr_id = 54;
create temporary table tmp_test as select * from main_dimension;
truncate table sys_record_data;
insert into tmp_test select * from tmp_test where madi_id = 1;

select * from main_dimension order by madi_id;
call stp_selectRecursive(81, 'sys.lang.nl', TRUE);
select * from main_dimension_record;
alter table main_relation
add column `marl_access_yn` tinyint(3) unsigned NOT NULL DEFAULT '1' after `marl_include_yn`;

rename column 
call stp_selectMeta('', 'sys.lang.nl');
call stp_deleteDimension(366, FALSE, FALSE);

call stp_removeRelationRecord(377);
show processlist;
commit;
kill 3242309;

select * from main_record_value
join main_dimension_record on madr_fk_record = mava_fk_record
join main_relation_record on marr_id = madr_fk_record
join main_dimension on madi_id = marr_fk_relation
where mava_fk_dimension = 127;

delete marr
from main_record_value
join main_dimension_record on madr_fk_record = mava_fk_record
join main_relation_record as marr on marr_id = madr_fk_record
join main_dimension on madi_id = marr_fk_relation
where mava_fk_dimension = 127;

delete madr
from main_record_value
join main_dimension_record as madr on madr_fk_record = mava_fk_record
where mava_fk_dimension = 127;

truncate table sys_record_data;
select * from main_record_value order by mava_id desc;
delete mava
from main_record_value as mava
where mava_fk_dimension = 127;


call stp_selectRecursiveLevels('madi_37', 'sys.lang.nl', FALSE, 0, 0);
call stp_selectRecursive(81, 'sys.lang.nl', TRUE);
call stp_selectRecursive(341, 'sys.lang.nl', TRUE);

call stp_selectRecursive(54, 'sys.lang.nl', TRUE);
select * from sys_record_data;

select func_getRecordData(54, 'sys.lang.nl');
call stp_selectMeta('', 'sys.lang.nl');