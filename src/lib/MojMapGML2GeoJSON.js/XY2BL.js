// geoConverter ported from geoConverter.java / svgMapTools

// Ported from https://github.com/svgmap/svgMapTools
// 2020/4/10 まずはxy2blのみ移植 さすがjavaだけに移植単純
// 2023/1/26 ESM化

// Copyright 2023 by Satoru Takagi @ KDDI All Rights Reserverd
//
// Programmed by Satoru Takagi
// License GPL v3 : See: https://www.gnu.org/licenses/gpl-3.0.html
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License version 3 as
//  published by the Free Software Foundation.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <http://www.gnu.org/licenses/>.

class XY2BL {
	// 楕円体の定数　a:半径 f:扁平率 D*:座標ずれ [m]
	static a_WGS = 6378137.0;
	static f_WGS = 1 / 298.257222101;
	static a_BL = 6377397.155;
	static f_BL = 1 / 299.152813;

	static TOKYO_BESSEL = 2;
	static dtorad = Math.PI / 180.0;
	static radtod = 1 / XY2BL.dtorad;
	static Phi = [
		0,
		33.0 * XY2BL.dtorad,
		33.0 * XY2BL.dtorad,
		36.0 * XY2BL.dtorad,
		33.0 * XY2BL.dtorad,
		36.0 * XY2BL.dtorad,
		36.0 * XY2BL.dtorad,
		36.0 * XY2BL.dtorad,
		36.0 * XY2BL.dtorad,
		36.0 * XY2BL.dtorad,
		40.0 * XY2BL.dtorad,
		44.0 * XY2BL.dtorad,
		44.0 * XY2BL.dtorad,
		44.0 * XY2BL.dtorad,
		26.0 * XY2BL.dtorad,
		26.0 * XY2BL.dtorad,
		26.0 * XY2BL.dtorad,
		26.0 * XY2BL.dtorad,
		20.0 * XY2BL.dtorad,
		26.0 * XY2BL.dtorad,
	];

	static Lambda = [
		0,
		129.5 * XY2BL.dtorad,
		131.0 * XY2BL.dtorad,
		(132.0 + 10.0 / 60.0) * XY2BL.dtorad,
		133.5 * XY2BL.dtorad,
		(134.0 + 20.0 / 60.0) * XY2BL.dtorad,
		136.0 * XY2BL.dtorad,
		(137.0 + 10.0 / 60.0) * XY2BL.dtorad,
		138.5 * XY2BL.dtorad,
		(139.0 + 50.0 / 60.0) * XY2BL.dtorad,
		(140.0 + 50.0 / 60.0) * XY2BL.dtorad,
		(140.0 + 15.0 / 60.0) * XY2BL.dtorad,
		(142.0 + 15.0 / 60.0) * XY2BL.dtorad,
		(144.0 + 15.0 / 60.0) * XY2BL.dtorad,
		142.0 * XY2BL.dtorad,
		127.5 * XY2BL.dtorad,
		124.0 * XY2BL.dtorad,
		131.0 * XY2BL.dtorad,
		136.0 * XY2BL.dtorad,
		154.0 * XY2BL.dtorad,
	];

	static xyToBl(x, y, kei, crs) {
		// x,y:XY座標系の値
		// kei:日本測地系　全19系の原点番号
		// crs: WGS84(JGD2000) or TOKYO_BESSEL
		// See http://vldb.gsi.go.jp/sokuchi/surveycalc/algorithm/xy2bl/xy2bl.htm
		var fnA, fnB, fnC, fnD;
		var Phi0, Lambda0, Phi1, Eta1_2, t1, N1, m0;
		var s_a, s_f, s_e, s_e_;
		var s_M;
		var ans = {};
		var i;

		if (crs && crs == XY2BL.TOKYO_BESSEL) {
			s_a = XY2BL.a_BL;
			s_f = XY2BL.f_BL;
		} else {
			s_a = XY2BL.a_WGS;
			s_f = XY2BL.f_WGS;
		}
		s_e = Math.sqrt(2 * s_f - s_f * s_f);
		s_e_ = Math.sqrt(2 * (1 / s_f) - 1) / (1 / s_f - 1);

		Phi0 = XY2BL.Phi[kei];
		Lambda0 = XY2BL.Lambda[kei];
		m0 = 0.9999;
		s_M = XY2BL.getMeridianArcLength(s_a, s_e, Phi0) + x / m0;
		Phi1 = XY2BL.getPhiFromMeridianArcLength(5, s_a, s_e, s_M, Phi0);
		N1 = XY2BL.getSpheroidN(Phi1, s_a, s_e);
		Eta1_2 = Math.pow(s_e_, 2) * Math.pow(Math.cos(Phi1), 2);
		// console.log( "s_M:" + s_M + " Phi1:" + Phi1 + " N1:" + N1 + " Eta1_2:" + Eta1_2 );
		t1 = Math.tan(Phi1);
		fnA =
			Phi1 -
			(1.0 / 2.0) *
				(1.0 / Math.pow(N1, 2)) *
				t1 *
				(1.0 + Eta1_2) *
				Math.pow(y / m0, 2);
		fnB =
			(1.0 / 24.0) *
			(1.0 / Math.pow(N1, 4)) *
			t1 *
			(5.0 +
				3.0 * Math.pow(t1, 2) +
				6.0 * Eta1_2 -
				6.0 * Math.pow(t1, 2) * Eta1_2 -
				3.0 * Math.pow(Eta1_2, 2) -
				9.0 * Math.pow(t1, 2) * Math.pow(Eta1_2, 2)) *
			Math.pow(y / m0, 4);
		fnC =
			-(1.0 / 720.0) *
			(1.0 / Math.pow(N1, 6)) *
			t1 *
			(61.0 +
				90.0 * Math.pow(t1, 2) +
				45.0 * Math.pow(t1, 4) +
				107.0 * Eta1_2 -
				162.0 * Math.pow(t1, 2) * Eta1_2 -
				45.0 * Math.pow(t1, 4) * Eta1_2) *
			Math.pow(y / m0, 6);
		fnD =
			(1.0 / 40320.0) *
			(1.0 / Math.pow(N1, 8)) *
			t1 *
			(1385.0 +
				3633.0 * Math.pow(t1, 2) +
				4095.0 * Math.pow(t1, 4) +
				1575.0 * Math.pow(t1, 6)) *
			Math.pow(y / m0, 8);
		ans.latitude = fnA + fnB + fnC + fnD;
		fnA = (1.0 / (N1 * Math.cos(Phi1))) * (y / m0);
		fnB =
			-(1.0 / 6.0) *
			(1.0 / (Math.pow(N1, 3) * Math.cos(Phi1))) *
			(1.0 + 2.0 * Math.pow(t1, 2) + Eta1_2) *
			Math.pow(y / m0, 3);
		fnC =
			(1.0 / 120.0) *
			(1.0 / (Math.pow(N1, 5) * Math.cos(Phi1))) *
			(5.0 +
				28.0 * Math.pow(t1, 2) +
				24.0 * Math.pow(t1, 4) +
				6.0 * Eta1_2 +
				8.0 * Math.pow(t1, 2) * Eta1_2) *
			Math.pow(y / m0, 5);
		fnD =
			-(1.0 / 5040.0) *
			(1.0 / (Math.pow(N1, 7) * Math.cos(Phi1))) *
			(61.0 +
				662.0 * Math.pow(t1, 2) +
				1320.0 * Math.pow(t1, 4) +
				720.0 * Math.pow(t1, 6)) *
			Math.pow(y / m0, 7);
		ans.longitude = Lambda0 + fnA + fnB + fnC + fnD;

		ans.altitude = 0;
		ans.latitude = ans.latitude * XY2BL.radtod;
		ans.longitude = ans.longitude * XY2BL.radtod;

		return ans;
	}

	static getMeridianArcLength(a, e, Phi) {
		var b = [];
		var a1 = [];
		var s;
		// console.log( "a:" + a + " e:" + e + " Phi:" + Phi );

		a1[1] =
			1.0 +
			(3.0 / 4.0) * Math.pow(e, 2) +
			(45.0 / 64.0) * Math.pow(e, 4) +
			(175.0 / 256.0) * Math.pow(e, 6) +
			(11025.0 / 16384.0) * Math.pow(e, 8) +
			(43659.0 / 65536.0) * Math.pow(e, 10) +
			(693693.0 / 1048576.0) * Math.pow(e, 12) +
			(19324305.0 / 29360128.0) * Math.pow(e, 14) +
			(4927697775.0 / 7516192768.0) * Math.pow(e, 16);
		a1[2] =
			(3.0 / 4.0) * Math.pow(e, 2) +
			(15.0 / 16.0) * Math.pow(e, 4) +
			(525.0 / 512.0) * Math.pow(e, 6) +
			(2205.0 / 2048.0) * Math.pow(e, 8) +
			(72765.0 / 65536.0) * Math.pow(e, 10) +
			(297297.0 / 262144.0) * Math.pow(e, 12) +
			(135270135.0 / 117440512.0) * Math.pow(e, 14) +
			(547521975.0 / 469762048.0) * Math.pow(e, 16);
		a1[3] =
			(15.0 / 64.0) * Math.pow(e, 4) +
			(105.0 / 256.0) * Math.pow(e, 6) +
			(2205.0 / 4096.0) * Math.pow(e, 8) +
			(10395.0 / 16384.0) * Math.pow(e, 10) +
			(1486485.0 / 2097152.0) * Math.pow(e, 12) +
			(45090045.0 / 58720256.0) * Math.pow(e, 14) +
			(766530765.0 / 939524096.0) * Math.pow(e, 16);
		a1[4] =
			(35.0 / 512.0) * Math.pow(e, 6) +
			(315.0 / 2048.0) * Math.pow(e, 8) +
			(31185.0 / 131072.0) * Math.pow(e, 10) +
			(165165.0 / 524288.0) * Math.pow(e, 12) +
			(45090045.0 / 117440512.0) * Math.pow(e, 14) +
			(209053845.0 / 469762048.0) * Math.pow(e, 16);
		a1[5] =
			(315.0 / 16384.0) * Math.pow(e, 8) +
			(3465.0 / 65536.0) * Math.pow(e, 10) +
			(99099.0 / 1048576.0) * Math.pow(e, 12) +
			(4099095.0 / 29360128.0) * Math.pow(e, 14) +
			(348423075.0 / 1879048192.0) * Math.pow(e, 16);
		a1[6] =
			(693.0 / 131072.0) * Math.pow(e, 10) +
			(9009.0 / 524288.0) * Math.pow(e, 12) +
			(4099095.0 / 117440512.0) * Math.pow(e, 14) +
			(26801775.0 / 469762048.0) * Math.pow(e, 16);
		a1[7] =
			(3003.0 / 2097152.0) * Math.pow(e, 12) +
			(315315.0 / 58720256.0) * Math.pow(e, 14) +
			(11486475.0 / 939524096.0) * Math.pow(e, 16);
		a1[8] =
			(45045.0 / 117440512.0) * Math.pow(e, 14) +
			(765765.0 / 469762048.0) * Math.pow(e, 16);
		a1[9] = (765765.0 / 7516192768.0) * Math.pow(e, 16);

		b[1] = a * (1.0 - e * e) * (a1[1] / 1.0);
		b[2] = a * (1.0 - e * e) * (-a1[2] / 2.0);
		b[3] = a * (1.0 - e * e) * (a1[3] / 4.0);
		b[4] = a * (1.0 - e * e) * (-a1[4] / 6.0);
		b[5] = a * (1.0 - e * e) * (a1[5] / 8.0);
		b[6] = a * (1.0 - e * e) * (-a1[6] / 10.0);
		b[7] = a * (1.0 - e * e) * (a1[7] / 12.0);
		b[8] = a * (1.0 - e * e) * (-a1[8] / 14.0);
		b[9] = a * (1.0 - e * e) * (a1[8] / 16.0);
		// console.log( "a1:" + a1[1] + " " + a1[2] + " " + a1[3] + " " + a1[4] + " " + a1[5] + " " + a1[6] + " " + a1[7] + " " + a1[8] + " " + a1[9] );
		// console.log( "b :" + b[1] + " " + b[2] + " " + b[3] + " " + b[4] + " " + b[5] + " " + b[6] + " " + b[7] + " " + b[8] + " " + b[9] );

		s =
			b[1] * Phi +
			b[2] * Math.sin(2 * Phi) +
			b[3] * Math.sin(4 * Phi) +
			b[4] * Math.sin(6 * Phi) +
			b[5] * Math.sin(8 * Phi) +
			b[6] * Math.sin(10 * Phi) +
			b[7] * Math.sin(12 * Phi) +
			b[8] * Math.sin(14 * Phi) +
			b[9] * Math.sin(16 * Phi);

		return s;
	}

	static getPhiFromMeridianArcLength(n, a, e, M, Phi0) {
		var s, Phi;
		Phi = Phi0;
		for (var i = 0; i < n; i++) {
			s = XY2BL.getMeridianArcLength(a, e, Phi);
			Phi =
				Phi +
				(2.0 *
					(s - M) *
					Math.pow(1.0 - e * e * (Math.sin(Phi) * Math.sin(Phi)), 3.0 / 2.0)) /
					(3.0 *
						e *
						e *
						(s - M) *
						Math.sin(Phi) *
						Math.cos(Phi) *
						Math.sqrt(1.0 - e * e * (Math.sin(Phi) * Math.sin(Phi))) -
						2.0 * a * (1.0 - e * e));
		}
		return Phi;
	}

	static getSpheroidN(Phi, a, e) {
		var W;
		W = XY2BL.getSpheroidW(Phi, e);
		return a / W;
	}

	static getSpheroidW(Phi, e) {
		return Math.sqrt(1 - e * e * (Math.sin(Phi) * Math.sin(Phi)));
	}
}

export { XY2BL };
