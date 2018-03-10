/*
	questionnaire: {
		fields: {
			ques_id: 	{ type: 'string' }, //,	elem: { tag: 'input',	label: 'DBID', type: 'text', placeholder: 'dbid'  } },
			ques_code: 	{ type: 'string',   elem: { tag: 'input',	label: 'Code', type: 'text', placeholder: 'code'  } },
			ques_desc: 	{ type: 'string',   elem: { tag: 'input',	label: 'Omschrijving', type: 'text', placeholder: 'omschrijving'  } },
			ques_type: 	{ type: 'string',   elem: { tag: 'input',	label: 'Type', type: 'text', placeholder: 'type'  } }
		},
		nodes: {
			options:   { type: 'schema' }
		}
	}
*/

SELECT
	madi.madi_code,
    marl.*,
    func_getRecordData(marl_fk_child_dimension, 'sys.lang.nl'),
    madl.madi_code,
    func_getRecordMeta(marl_id, '')
FROM main_dimension AS madi
JOIN main_relation AS marl
  ON marl.marl_fk_parent_dimension = madi.madi_id
JOIN main_dimension AS madl
  ON madl.madi_id = marl.marl_id
WHERE madi.madi_id = 11;

select * from main_record_value where mava_fk_record in (3,4,6);

select * from main_dimension where madi_id in (1, 8, 11, 12, 155, 136) or madi_fk_parent = 11;

select * from main_dimension where madi_id in (13, 133, 137);

select * from main_dimension order by madi_code;

