use purejs_test;


select concat('max(case when attr.madi_code = \'', madi_code, '\' then mava_value else \'\' end) as ', replace(madi_code, '.', '_'), ',')
from main_dimension
where madi_code like 'sys.attr%'
order by madi_code;

select
	madi.madi_code,
	max(case when attr.madi_code = 'sys.attr.tag' then mava_value else '' end) as sys_attr_tag,
	max(case when attr.madi_code = 'sys.attr.type' then mava_value else '' end) as sys_attr_type,
	max(case when attr.madi_code = 'sys.attr.code' then mava_value else '' end) as sys_attr_code,
	max(case when attr.madi_code = 'sys.attr.label' then mava_value else '' end) as sys_attr_label,
	max(case when attr.madi_code = 'sys.attr.desc' then mava_value else '' end) as sys_attr_desc,
    max(case when attr.madi_code = 'sys.attr.class' then mava_value else '' end) as sys_attr_class,
	max(case when attr.madi_code = 'sys.attr.icon' then mava_value else '' end) as sys_attr_icon,
	max(case when attr.madi_code = 'sys.attr.options' then mava_value else '' end) as sys_attr_options,
	max(case when attr.madi_code = 'sys.attr.path' then mava_value else '' end) as sys_attr_path,
	max(case when attr.madi_code = 'sys.attr.prefix' then mava_value else '' end) as sys_attr_prefix,
	max(case when attr.madi_code = 'sys.attr.route' then mava_value else '' end) as sys_attr_route,
	max(case when attr.madi_code = 'sys.attr.answer' then mava_value else '' end) as sys_attr_answer
from main_dimension as madi
left join main_record_value
  on mava_fk_record = madi.madi_id
left join main_dimension as attr
  on attr.madi_id = mava_fk_dimension
group by madi.madi_code
order by madi.madi_code;

select
	madr.madr_id,
    madi.madi_code,
	max(case when attr.madi_code = 'sys.attr.tag' then mava_value else '' end) as sys_attr_tag,
	max(case when attr.madi_code = 'sys.attr.type' then mava_value else '' end) as sys_attr_type,
	max(case when attr.madi_code = 'sys.attr.code' then mava_value else '' end) as sys_attr_code,
	max(case when attr.madi_code = 'sys.attr.label' then mava_value else '' end) as sys_attr_label,
	max(case when attr.madi_code = 'sys.attr.desc' then mava_value else '' end) as sys_attr_desc,
    max(case when attr.madi_code = 'sys.attr.class' then mava_value else '' end) as sys_attr_class,
	max(case when attr.madi_code = 'sys.attr.icon' then mava_value else '' end) as sys_attr_icon,
	max(case when attr.madi_code = 'sys.attr.options' then mava_value else '' end) as sys_attr_options,
	max(case when attr.madi_code = 'sys.attr.path' then mava_value else '' end) as sys_attr_path,
	max(case when attr.madi_code = 'sys.attr.prefix' then mava_value else '' end) as sys_attr_prefix,
	max(case when attr.madi_code = 'sys.attr.route' then mava_value else '' end) as sys_attr_route,
	max(case when attr.madi_code = 'sys.attr.answer' then mava_value else '' end) as sys_attr_answer
from main_dimension_record as madr
left join main_record_value
  on mava_fk_record = madr.madr_fk_record
left join main_dimension as attr
  on attr.madi_id = mava_fk_dimension
left join main_relation_record
  on marr_id = madr_fk_record
join main_dimension as madi
  on madi.madi_id = coalesce(marr_fk_relation, madr.madr_fk_dimension)
group by madr.madr_id, madi.madi_code
order by madr.madr_id, madi.madi_code;

select * from main_record_value;

