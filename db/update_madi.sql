drop temporary table if exists tmp_madi;	
create temporary table tmp_madi (	
madi_code	varchar(250) not null,
sys_attr_tag	varchar(250) not null,
sys_attr_type	varchar(250) not null,
sys_attr_code	varchar(250) not null,
sys_attr_label	varchar(250) not null,
sys_attr_desc	varchar(250) not null,
sys_attr_class	varchar(250) not null,
sys_attr_icon	varchar(250) not null,
sys_attr_options	varchar(250) not null,
sys_attr_path	varchar(250) not null,
sys_attr_prefix	varchar(250) not null,
sys_attr_route	varchar(250) not null,
sys_attr_answer	varchar(250) not null,
primary key (madi_code)	
);	

insert into tmp_madi values
('sys', '', '', 'sys', 'System', '', '', 'fab fa-centercode', '', '', '', '', ''),
('sys.type.app', '', '', 'sys.type.app', 'Applicatie', '', '', 'fas fa-chart-line', '', '', '', '', ''),
('sys.type.app.item', '', '', 'sys.type.app.item', 'Item', '', '', 'fab fa-chrome', '', '', '', '', ''),
('sys.type.app.item.item', '', '', 'sys.type.app.item.item', 'Subitem', '', '', 'fab fa-chrome', '', '', '', '', ''),
('sys.attr', 'input', 'string', 'sys.attr', 'Attribuut', '', '', 'fas fa-pencil-alt', '', '', '', '', ''),
('sys.attr.answer', '', '', 'sys.attr.answer', 'Antwoord', '', '', 'far fa-thumbs-up', '', '', '', '', ''),
('sys.attr.class', '', '', 'sys.attr.class', 'Class', '', '', 'far fa-copyright', '', '', '', '', ''),
('sys.attr.code', '', '', 'sys.attr.code', 'Code', '', '', 'fas fa-eye', '', '', '', '', ''),
('sys.attr.desc', '', '', 'sys.attr.desc', 'Omschrijving', '', '', 'fab fa-amilia', '', '', '', '', ''),
('sys.attr.icon', '', '', 'sys.attr.icon', 'Icoon', '', '', 'fas fa-bullseye', '', '', '', '', ''),
('sys.attr.label', '', '', 'sys.attr.label', 'Label', '', '', 'fas fa-audio-description', '', '', '', '', ''),
('sys.attr.options', '', '', 'sys.attr.options', 'Options', '', '', 'far fa-edit', '', '', '', '', ''),
('sys.attr.path', '', '', 'sys.attr.path', 'Path', '', '', 'fas fa-exchange-alt', '', '', '', '', ''),
('sys.attr.prefix', '', '', 'sys.attr.prefix', 'Prefix', '', '', 'fas fa-ellipsis-h', '', '', '', '', ''),
('sys.attr.route', '', '', 'sys.attr.route', 'Route', '', '', 'fas fa-ellipsis-v', '', '', '', '', ''),
('sys.attr.query', '', '', 'sys.attr.query', 'Query', '', '', 'fas fa-ellipsis-v', '', '', '', '', ''),
('sys.attr.tag', 'select', '', 'sys.attr.tag', 'Tag', '', '', 'fas fa-tag', '', '', '', '', ''),
('sys.attr.type', '', '', 'sys.attr.type', 'Type', '', '', 'fas fa-expand', '', '', '', '', ''),
('sys.event', '', '', 'sys.event', 'Event', '', '', 'fas fa-exclamation', '', '', '', '', ''),
('sys.event.click', '', '', 'sys.event.click', 'Event-Click', '', '', 'fas fa-tint', '', '', '', '', ''),
('sys.lang', '', '', 'sys.lang', 'Taal', '', '', 'fab fa-whmcs', '', 'components/nav-sidebar', '', '', ''),
('sys.lang.en', '', '', 'sys.lang.en', 'Engels', '', '', 'fab fa-whmcs', '', '', '', '', ''),
('sys.lang.nl', '', '', 'sys.lang.nl', 'Nederlands', '', '', 'fab fa-whmcs', '', '', '', '', ''),
('sys.meta', '', '', 'sys.meta', 'Meta', '', '', 'fas fa-terminal', '', '', '', '', ''),
('sys.meta.desc', '', '', 'sys.meta.desc', 'Meta-Omschrijving', '', '', 'fas fa-terminal', '', '', '', '', ''),
('sys.type', '', '', 'sys.type', 'Type', '', '', 'fas fa-asterisk', '', '', '', '', ''),
('sys.type.basket', '', '', 'sys.type.basket', 'Mandje', '', '', 'fas fa-bold', '', '', '', '', ''),
('sys.type.basket.item', '', '', 'sys.type.basket.item', 'Mandje-Item', '', '', 'fas fa-book', '', '', '', '', ''),
('sys.type.component', '', '', 'sys.type.component', 'Component', '', '', 'far fa-sun', '', '', '', '', ''),
('sys.type.endpoint', '', '', 'sys.type.endpoint', 'Endpoint', '', '', 'fas fa-database', '', '', '', '', ''),
('sys.type.entity', '', '', 'sys.type.entity', 'Entiteit', '', '', 'far fa-file', '', '', '', '', ''),
('sys.type.entity.item', '', '', 'sys.type.entity.item', 'Entiteit-Item', '', '', 'fas fa-book', '', '', '', '', ''),
('sys.type.entity.question', '', '', 'sys.type.entity.question', 'Entiteit-Vraag', '', '', 'fas fa-question', '', '', '', '', ''),
('sys.type.item', '', '', 'sys.type.item', 'Item', '', '', 'fas fa-book', '', '', '', '', ''),
('sys.type.module', '', '', 'sys.type.module', 'Module', '', '', 'fab fa-medium', '', '', '', '', ''),
('sys.type.module.component', '', '', 'sys.type.module.component', 'Module-Component', '', '', 'far fa-sun', '', '', '', '', ''),
('sys.type.module.endpoint', '', '', 'sys.type.module.endpoint', 'Module-Endpoint', '', '', 'fas fa-database', '', '', '', '', ''),
('sys.type.option', '', '', 'sys.type.option', 'Optie', '', '', 'far fa-edit', '', '', '', '', ''),
('sys.type.program', '', '', 'sys.type.program', 'Programma', '', '', 'far fa-map', '', '', '', '', ''),
('sys.type.program.question', '', '', 'sys.type.program.question', 'Programma-Vraag', '', '', 'fas fa-question', '', '', '', '', ''),
('sys.type.question', '', '', 'sys.type.question', 'Vraag', '', '', 'fas fa-question', '', '', '', '', ''),
('sys.type.question.option', '', '', 'sys.type.question.option', 'Vraag-Optie', '', '', 'far fa-edit', '', '', '', '', ''),
('sys.type.tag', '', '', 'sys.type.tag', 'Tag', '', '', 'fas fa-tag', '', '', '', '', ''),
('sys.type.user', '', '', 'sys.type.user', 'Gebruiker', '', '', 'fas fa-user', '', '', '', '', '');

update main_record_value as mava
join 
(
	select
		0 as mava_id,
		madi.madi_id as mava_fk_record,
		func_getDimensionID(
			case when madi.madi_code like 'sys.attr%' then 'sys.attr.label' else 'sys.attr.desc' end
		) as mava_fk_dimension,
		func_getDimensionID('sys.lang.nl') as mava_fk_language,
		null as mava_fk_value,
		tmp.sys_attr_label as mava_value
	from tmp_madi as tmp
	join main_dimension as madi
	  on madi.madi_code = tmp.madi_code
) as tmp
on tmp.mava_fk_record = mava.mava_fk_record
and tmp.mava_fk_dimension = mava.mava_fk_dimension
and tmp.mava_fk_language = mava.mava_fk_language
set mava.mava_value = tmp.mava_value;

insert into main_record_value (mava_id, mava_fk_record, mava_fk_dimension, mava_fk_language, mava_fk_value, mava_value)
select *
from
(
	select
		0 as mava_id,
		madi.madi_id as mava_fk_record,
		func_getDimensionID(
			case when madi.madi_code like 'sys.attr%' then 'sys.attr.label' else 'sys.attr.desc' end
		) as mava_fk_dimension,
		func_getDimensionID('sys.lang.nl') as mava_fk_language,
		null as mava_fk_value,
		tmp.sys_attr_label as mava_value
	from tmp_madi as tmp
	join main_dimension as madi
	  on madi.madi_code = tmp.madi_code
) as tmp
where not exists
	(select 1 from main_record_value as mava
		where mava.mava_fk_record = tmp.mava_fk_record
		  and mava.mava_fk_dimension = tmp.mava_fk_dimension
          and mava.mava_fk_language = tmp.mava_fk_language);
