(function (factory) {
	
	if (typeof exports !== 'undefined') {
		module.exports = factory(require('leaflet'))
	} else if (window.L) {
		factory(window.L)
	} else {
		throw new Error('require LeafLet')
	}

})(function (L) {

	var MAX_ZOOM = 18
	var BIAS = 25600000
	var TILE_URL = (
		'http://online1.map.bdimg.com/onlinelabel/' +
		'?qt=tile&x={x}&y={y}&z={z}&styles=pl&udt=20170106&scaler=1&p=0'
	)

	L.CRS.BaiduCRS = L.extend({}, L.CRS.Earth, {

		code: 'BaiduTileCRS',

		projection: L.Projection.SphericalMercator,

		scale: function (zoom) {
			return Math.pow(2, MAX_ZOOM - zoom) // m/px
		},

		transformation: {
			transform: function (point, scale) {
				return this._transform(point.clone, scale)
			},
			_transform: function (point, scale) {
				point.x = (BIAS + point.x) / scale
				point.y = (BIAS - point.y) / scale
				return point
			},
			untransform: function (point, scale) {
				return L.point(
					point.x * scale - BIAS,
					BIAS - point.y * scale
				)
			}
		}
	})

	L.BaiduTileLayer = L.TileLayer.extend({
		getTileUrl: function (coords) {
			var z = this._getZoomForUrl()
			var scale = L.CRS.BaiduCRS.scale(z)
			var s = BIAS / (scale * 256)
			var x = Math.floor(coords.x - s)
			var y = Math.floor(s - coords.y)
			return L.Util.template(TILE_URL, {
				x: x,
				y: y,
				z: z
			})
		}
	})
})