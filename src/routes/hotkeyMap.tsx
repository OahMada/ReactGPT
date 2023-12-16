import { useNavigate } from 'react-router-dom';
import { useKeys, hotkeyMap } from '../utils';

var { 'Hotkey Map Page': hotkeyMapHotkeys } = hotkeyMap;

export var HotkeyMap = () => {
	let navigate = useNavigate();
	let hotkeyMapData = Object.entries(hotkeyMap);

	let clickExitButton = () => {
		navigate(-1);
	};

	useKeys({ keyBinding: hotkeyMapHotkeys.exit.hotkey, callback: clickExitButton });

	return (
		<section>
			<button onClick={clickExitButton} data-tooltip-id='hotkey' data-tooltip-content={hotkeyMapHotkeys.exit.label}>
				Exit
			</button>
			<div>
				{hotkeyMapData.map((item) => {
					let hotkeys = Object.entries(item[1]);
					return (
						<table key={item[0]}>
							<thead>
								<tr>
									<th>{item[0]}</th>
								</tr>
							</thead>
							<tbody>
								{hotkeys.map((hotkey) => {
									return (
										<tr key={hotkey[0]}>
											<td>{hotkey[1].label}</td>
											<td>{hotkey[1].purpose}</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					);
				})}
			</div>
		</section>
	);
};
