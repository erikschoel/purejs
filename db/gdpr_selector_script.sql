-- truncate table main_selector_record;
-- delete from main_selector;

insert into main_selector
select *
from
(
	select
		0 as sele_id,
		ques.tmp_dbid as sele_fk_record,
		func_getDimensionID('sys.attr.answer') as sele_fk_dimension,
		marr_id as sele_fk_value,
		'=' as sele_operator,
		null as sele_value,
		'' as sele_type
	-- select *
	from tmp_question_option as opt
	join tmp_question_option_unique as optu
	  on opt.tmp_id = optu.tmp_opt_id
	join tmp_questions as ques
	  on ques.tmp_id = opt.tmp_question
	join tmp_options as o
	  on optu.tmp_code = o.tmp_code
	join main_dimension_record
	  on madr_id = o.tmp_dbid
	join main_relation_record as marr
      on marr.marr_fk_parent = ques.tmp_dbid
	 and marr.marr_fk_child = o.tmp_dbid
	join main_record_value
	  on mava_fk_record = madr_fk_record
	 and mava_fk_dimension = func_getDimensionID('sys.attr.code')
	 and mava_value = optu.tmp_code
	where tmp_item != ''
) as tmp
where not exists
	(select 1 from main_selector
		where sele_fk_record = tmp.sele_fk_record
		  and sele_fk_dimension = tmp.sele_fk_dimension
          and sele_fk_value = tmp.sele_fk_value
          and sele_operator = '=');

CALL stp_upsertDimensionRecord('sys.type.tag', 'QUES-ITEM', @tag_id);

insert into main_selector_record
select *
from
(
	select
		0 as sere_id,
        func_getMareID(concat('madr_', @tag_id)) as sere_fk_tag,
        sele.sele_id as sere_fk_selector,
        madritm.madr_id as sere_fk_record
	-- select *, func_getRecordData(madritm.madr_fk_record, 'sys.lang.nl')
	from tmp_question_option as opt
	join tmp_question_option_unique as optu
	  on opt.tmp_id = optu.tmp_opt_id
	join tmp_questions as ques
	  on ques.tmp_id = opt.tmp_question
	join main_dimension_record as madr
	  on madr.madr_id = ques.tmp_dbid
	join tmp_options as o
	  on optu.tmp_code = o.tmp_code
	join main_dimension_record as madr_opt
	  on madr_opt.madr_id = o.tmp_dbid
	join main_relation_record as marr
      on marr.marr_fk_parent = ques.tmp_dbid
	 and marr.marr_fk_child = o.tmp_dbid
	join main_record_value as mavopt
	  on mavopt.mava_fk_record = madr_opt.madr_fk_record
	 and mavopt.mava_fk_dimension = func_getDimensionID('sys.attr.code')
	 and mavopt.mava_value = optu.tmp_code
	join main_record_value as mavitm
      on mavitm.mava_value = upper(tmp_item)
	 and mavitm.mava_fk_dimension = func_getDimensionID('sys.attr.code')
	join main_dimension_record as madritm
      on madritm.madr_fk_record = mavitm.mava_fk_record
	 and madritm.madr_fk_dimension = func_getDimensionID('sys.type.item')
	join main_selector as sele
	  on sele.sele_fk_record = ques.tmp_dbid
	 and sele.sele_fk_dimension = func_getDimensionID('sys.attr.answer')
	 and sele.sele_fk_value = marr.marr_id
	 and sele.sele_operator = '='
	where tmp_item != ''
) as tmp
where not exists
	(select 1 from main_selector_record
		where sere_fk_tag = tmp.sere_fk_tag
		  and sere_fk_selector = tmp.sere_fk_selector
          and sere_fk_record = tmp.sere_fk_record);
